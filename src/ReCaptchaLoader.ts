import {ReCaptchaInstance} from './ReCaptchaInstance'

/**
 * This is a loader which takes care about loading the
 * official recaptcha script (https://www.google.com/recaptcha/api.js).
 *
 * The main method {@link ReCaptchaLoader#load(siteKey: string)} also
 * prevents loading the recaptcha script multiple times.
 */
class ReCaptchaLoader {
  /**
   * Loads the recaptcha library with the given site key.
   *
   * @param siteKey The site key to load the library with.
   * @param options The options for the loader
   * @return The recaptcha wrapper.
   */
  public static load(siteKey: string, options: IReCaptchaLoaderOptions = {}): Promise<ReCaptchaInstance> {
    // Browser environment
    if (typeof document === 'undefined')
      return Promise.reject(new Error('This is a library for the browser!'))

    // Check if grecaptcha is already registered.
    if (ReCaptchaLoader.getLoadingState() === ELoadingState.LOADED)
    // Check if the site key is equal to the already loaded instance
      if (ReCaptchaLoader.instance.getSiteKey() === siteKey)
      // Resolve existing instance
        return Promise.resolve(ReCaptchaLoader.instance)
      else
      // Reject because site keys are different
        return Promise.reject(new Error('reCAPTCHA already loaded with different site key!'))

    // If the recaptcha is loading add this loader to the queue.
    if (ReCaptchaLoader.getLoadingState() === ELoadingState.LOADING) {
      // Check if the site key is equal to the current loading site key
      if (siteKey !== ReCaptchaLoader.instanceSiteKey)
        return Promise.reject('reCAPTCHA already loaded with different site key!')

      return new Promise<ReCaptchaInstance>((resolve, reject) => {
        ReCaptchaLoader.successfulLoadingConsumers.push((instance: ReCaptchaInstance) => resolve(instance))
        ReCaptchaLoader.errorLoadingRunnable.push((reason: any) => reject())
      })
    }

    // Set states
    ReCaptchaLoader.instanceSiteKey = siteKey
    ReCaptchaLoader.setLoadingState(ELoadingState.LOADING)

    // Throw error if the recaptcha is already loaded
    const loader = new ReCaptchaLoader()
    return new Promise((resolve, reject) => {
      loader.loadScript(siteKey, options.useRecaptchaNet || false).then(() => {
        ReCaptchaLoader.setLoadingState(ELoadingState.LOADED)

        const instance = new ReCaptchaInstance(siteKey, grecaptcha)
        ReCaptchaLoader.successfulLoadingConsumers.forEach((v) => v(instance))
        ReCaptchaLoader.successfulLoadingConsumers = []

        // Check for auto hide badge option
        if (options.autoHideBadge || false)
          instance.hideBadge()

        ReCaptchaLoader.instance = instance
        resolve(instance)
      }).catch((error) => {
        ReCaptchaLoader.errorLoadingRunnable.forEach((v) => v(error))
        ReCaptchaLoader.errorLoadingRunnable = []
        reject(error)
      })
    })
  }

  public static getInstance(): ReCaptchaInstance {
    return ReCaptchaLoader.instance
  }

  private static loadingState: ELoadingState = null
  private static instance: ReCaptchaInstance = null
  private static instanceSiteKey: string = null

  private static successfulLoadingConsumers: Array<(instance: ReCaptchaInstance) => void> = []
  private static errorLoadingRunnable: Array<(reason: any) => void> = []

  /**
   * Will set the loading state of the recaptcha script.
   *
   * @param state New loading state for the loading process.
   */
  private static setLoadingState(state: ELoadingState) {
    ReCaptchaLoader.loadingState = state
  }

  /**
   * Will return the current loading state. If no loading state is globally set
   * the NO_LOADED state is set as default.
   */
  private static getLoadingState(): ELoadingState {
    if (ReCaptchaLoader.loadingState === null)
      return ELoadingState.NOT_LOADED
    else
      return ReCaptchaLoader.loadingState
  }

  /**
   * The actual method that loads the script.
   * This method will create a new script element
   * and append it to the "<head>" element.
   *
   * @param siteKey The site key to load the library with.
   * @param useRecaptchaNet If the loader should use "recaptcha.net" instead of "google.com"
   */
  private loadScript(siteKey: string, useRecaptchaNet: boolean = false): Promise<HTMLScriptElement> {
    // Create script element
    const scriptElement: HTMLScriptElement = document.createElement('script')
    scriptElement.setAttribute('recaptcha-v3-script', '')

    let scriptBase = 'https://www.google.com/recaptcha/api.js'
    if (useRecaptchaNet)
      scriptBase = 'https://recaptcha.net/recaptcha/api.js'

    scriptElement.src = scriptBase + '?render=' + siteKey

    return new Promise<HTMLScriptElement>((resolve, reject) => {
      scriptElement.addEventListener('load', this.waitForScriptToLoad(() => {
        resolve(scriptElement)
      }), false)
      scriptElement.onerror = (error) => {
        reject(new Error('Something went wrong while loading ReCaptcha. (' + error.toString() + ')'))
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
        }, 25)
      else
        (window as any).grecaptcha.ready(() => {
          callback()
        })
    }
  }
}

enum ELoadingState {
  NOT_LOADED,
  LOADING,
  LOADED
}

/**
 * An interface for all available options for the
 * reCAPTCHA loader.
 */
export interface IReCaptchaLoaderOptions {
  /**
   * By default the loader uses "google.com", with this
   * option set to `true` it will use "recaptcha.net".
   * (See: https://github.com/AurityLab/recaptcha-v3/pull/2)
   */
  useRecaptchaNet?: boolean,

  /**
   * Will automatically hide the badge after loading
   * recaptcha. Warning: The usage of this option is only
   * allowed if you follow the official guide for hiding
   * the badge from Google:
   * https://developers.google.com/recaptcha/docs/faq#id-like-to-hide-the-recaptcha-v3-badge-what-is-allowedl
   */
  autoHideBadge?: boolean
}

/**
 * Only export the recaptcha load and getInstance method to
 * avoid confusion with the class constructor.
 */
export const load = ReCaptchaLoader.load
export const getInstance = ReCaptchaLoader.getInstance
