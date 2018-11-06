export class ReCaptcha {
    public constructor() {

    }

    private isLoaded (): boolean {
        return (window as any).recaptchaV3Registered != undefined
    }

}