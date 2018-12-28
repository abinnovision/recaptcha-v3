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
      throw new Error('This is a library for the browser!')

    // Check if grecaptcha is already registered.
    if (ReCaptchaLoader.getLoadingState() === ELoadingState.LOADED)
      return Promise.resolve(new ReCaptchaInstance(siteKey, grecaptcha))

    // If the recaptcha is loading add this loader to the queue.
    if (ReCaptchaLoader.getLoadingState() === ELoadingState.LOADING)
      return new Promise<ReCaptchaInstance>((resolve, reject) => {
        ReCaptchaLoader.successfulLoadingConsumers.push((instance: ReCaptchaInstance) => resolve(instance))
        ReCaptchaLoader.errorLoadingRunnable.push((reason: any) => reject())
      })

    ReCaptchaLoader.setLoadingState(ELoadingState.LOADING)

    // Throw error if the recaptcha is already loaded
    const loader = new ReCaptchaLoader()
    return new Promise((resolve, reject) => {
      loader.loadScript(siteKey, options.useRecaptchaNet || false).then(() => {
        ReCaptchaLoader.setLoadingState(ELoadingState.LOADED)

        const instance = new ReCaptchaInstance(siteKey, grecaptcha)
        ReCaptchaLoader.successfulLoadingConsumers.forEach((v) => v(instance))
        ReCaptchaLoader.successfulLoadingConsumers = []
        resolve(instance)
      }).catch((error) => {
        ReCaptchaLoader.errorLoadingRunnable.forEach((v) => v(error))
        ReCaptchaLoader.errorLoadingRunnable = []
        reject(error)
      })
    })
  }

  private static stateAttributeName = 'recaptcha-v3-state'
  private static successfulLoadingConsumers: Array<(instance: ReCaptchaInstance) => void> = []
  private static errorLoadingRunnable: Array<(reason: any) => void> = []

  /**
   * Will set the loading state of the recaptcha script.
   *
   * @param state New loading state for the loading process.
   */
  private static setLoadingState(state: ELoadingState) {
    document.documentElement.setAttribute(ReCaptchaLoader.stateAttributeName, state as any as string)
  }

  /**
   * Will return the current loading state. If no loading state is globally set
   * the NO_LOADED state is set as default.
   */
  private static getLoadingState(): ELoadingState {
    const element = document.documentElement

    if (element.hasAttribute(ReCaptchaLoader.stateAttributeName)) {
      const val = parseInt(element.getAttribute(ReCaptchaLoader.stateAttributeName), 10)
      if (isNaN(val))
        return ELoadingState.NOT_LOADED
      return val
    } else
      return ELoadingState.NOT_LOADED
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
        }, 100)
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
  LOADED,
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
  useRecaptchaNet?: boolean
}

/**
 * Only export the recaptcha load method directly to
 * avoid confusion with the class constructor.
 */
export const load = ReCaptchaLoader.load
