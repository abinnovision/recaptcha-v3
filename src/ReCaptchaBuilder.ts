import {ReCaptcha} from "./ReCaptcha";

class ReCaptchaLoader {
    public static load(siteKey: string): Promise<ReCaptcha> {
        // Browser environment
        if (document === undefined)
            throw new ReCaptchaLoaderError("This is a library for the browser!");

        // Throw error if the recaptcha is already loaded
        let loader = new ReCaptchaLoader();
        if (loader.alreadyLoaded())
            throw ReCaptchaLoaderError.alreadyLoadedError();

        return new Promise<ReCaptcha>((resolve, reject) => {
            loader.loadScript(siteKey).then(value => {
                loader.setLoaded();
                resolve(new ReCaptcha());
            }).catch(reject);
        });
    }

    private alreadyLoaded(): boolean {
        return document.documentElement.hasAttribute("recaptcha-v3-loaded")
    }

    private setLoaded(): void {
        document.documentElement.setAttribute("recaptcha-v3-loaded", "");
    }

    private loadScript(siteKey: string): Promise<HTMLScriptElement> {
        if (this.hasReCaptchaScript())
            throw ReCaptchaLoaderError.alreadyLoadedError();

        // Create script element
        const scriptElement: HTMLScriptElement = document.createElement("script");
        scriptElement.setAttribute("recaptcha-v3-script", "");
        scriptElement.src = "https://www.google.com/recaptcha/api.js?render=" + siteKey;

        return new Promise<HTMLScriptElement>((resolve, reject) => {
            scriptElement.addEventListener('load', this.waitForScriptToLoad(() => {
                resolve(scriptElement);
            }), false)
            scriptElement.onerror = (error) => {
                reject(new ReCaptchaLoaderError("Something went wrong while loading ReCaptcha. (" + error.toString() + ")"))
            };
            document.head.appendChild(scriptElement)
        })
    }

    private waitForScriptToLoad(callback: () => void) {
        return () => {
            if ((window as any).grecaptcha === undefined)
                setTimeout(() => {
                    this.waitForScriptToLoad(callback)
                }, 100);
            else {
                (window as any).grecaptcha.ready(function () {
                    callback()
                });
            }
        }
    }

    private hasReCaptchaScript(): boolean {
        const scripts = document.head.getElementsByTagName("script");

        for(let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            if(script.hasAttribute("recaptcha-v3-script"))
                return true;
        }

        return false;
    }
}

class ReCaptchaLoaderError extends Error {
    constructor(message: string) {
        super(message);
    }

    public static alreadyLoadedError(): ReCaptchaLoaderError {
        return new ReCaptchaLoaderError("ReCaptcha already loaded!");
    }
}

export const loadReCaptcha = ReCaptchaLoader.load;
