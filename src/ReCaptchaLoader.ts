import {ReCaptchaLoaderError} from './ReCaptchaLoaderError'
import {ReCaptchaWrapper} from './ReCaptchaWrapper'

/**
 * This is a loader which takes care about loading the
 * official recaptcha script (https://www.google.com/recaptcha/api.js).
 *
 * The main method {@link ReCaptchaLoader#load(siteKey: string)} also
 * prevents loading the recaptcha script multiple times.
 */
class ReCaptchaLoader {
  /**
   * Lodas the recaptcha library with the given site key.
   *
   * @param siteKey The site key to load the library with.
   * @return The recaptcha wrapper.
   */
  public static async load(siteKey: string): Promise<ReCaptchaWrapper> {
    // Browser environment
    if (typeof document === 'undefined')
      throw (new ReCaptchaLoaderError('This is a library for the browser!'))

    // Check if grecaptcha is already registered.
    if ((window as any).grecaptcha !== undefined)
      throw (new ReCaptchaWrapper(siteKey, grecaptcha))

    // Throw error if the recaptcha is already loaded
    const loader = new ReCaptchaLoader()
    if (ReCaptchaLoader.alreadyLoaded())
      throw (ReCaptchaLoaderError.alreadyLoadedError())

    await loader.loadScript(siteKey)

    ReCaptchaLoader.setLoaded()
    return new ReCaptchaWrapper(siteKey, grecaptcha)
  }

  /**
   * Checks if the recaptcha is already loaded.
   * The check is based on an attribute ob the "<html>" element.
   */
  private static alreadyLoaded(): boolean {
    return document.documentElement.hasAttribute('recaptcha-v3-loaded')
  }

  /**
   * Globally saves that recaptcha has been loaded.
   * Will set a special attribute to the "<html>" element.
   */
  private static setLoaded(): void {
    document.documentElement.setAttribute('recaptcha-v3-loaded', '')
  }

  /**
   * Checks if the "<head>" element already contains an recaptcha script.
   */
  private static hasReCaptchaScript(): boolean {
    const scripts = document.head.getElementsByTagName('script')

    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i]
      if (script.hasAttribute('recaptcha-v3-script'))
        return true
    }

    return false
  }

  /**
   * The actual method that loads the script.
   * This method will create a new script element
   * and append it to the "<head>" element.
   *
   * @param siteKey The site key to load the library with.
   */
  private loadScript(siteKey: string): Promise<HTMLScriptElement> {
    if (ReCaptchaLoader.hasReCaptchaScript())
      throw ReCaptchaLoaderError.alreadyLoadedError()

    // Create script element
    const scriptElement: HTMLScriptElement = document.createElement('script')
    scriptElement.setAttribute('recaptcha-v3-script', '')
    scriptElement.src = 'https://www.google.com/recaptcha/api.js?render=' + siteKey

    return new Promise<HTMLScriptElement>((resolve, reject) => {
      scriptElement.addEventListener('load', this.waitForScriptToLoad(() => {
        resolve(scriptElement)
      }), false)
      scriptElement.onerror = (error) => {
        reject(new ReCaptchaLoaderError('Something went wrong while loading ReCaptcha. (' + error.toString() + ')'))
      }
      document.head.appendChild(scriptElement)
    })
  }

  /**
   * Sometimes the library does not directly load
   * after the "onload" event, therefore we wait
   * here until "grecaptcha" is available.
   *
   * @param callback Callback to call after the library
   * has been loaded successfully.
   */
  private waitForScriptToLoad(callback: () => void) {
    return () => {
      if ((window as any).grecaptcha === undefined)
        setTimeout(() => {
          this.waitForScriptToLoad(callback)
        }, 100)
      else
        (window as any).grecaptcha.ready(() => {
          callback()
        })
    }
  }
}

/**
 * Only export the recaptcha load method directly to
 * avoid confusion with the class constructor.
 */
export const load = ReCaptchaLoader.load
