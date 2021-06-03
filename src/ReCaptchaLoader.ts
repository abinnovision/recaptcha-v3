import {IReCaptchaInstance, IRenderParameters} from './grecaptcha/grecaptcha'
import {ReCaptchaInstance} from './ReCaptchaInstance'

enum ELoadingState {
  NOT_LOADED,
  LOADING,
  LOADED,
}

/**
 * This is a loader which takes care about loading the
 * official recaptcha script (https://www.google.com/recaptcha/api.js).
 *
 * The main method {@link ReCaptchaLoader#load(siteKey: string)} also
 * prevents loading the recaptcha script multiple times.
 */
class ReCaptchaLoader {
  private static loadingState: ELoadingState = null
  private static instance: ReCaptchaInstance = null
  private static instanceSiteKey: string = null

  private static successfulLoadingConsumers: Array<(instance: ReCaptchaInstance) => void> = []
  private static errorLoadingRunnable: Array<(reason: Error) => void> = []

  private static readonly SCRIPT_LOAD_DELAY = 25

  /**
   * Loads the recaptcha library with the given site key.
   *
   * @param siteKey The site key to load the library with.
   * @param options The options for the loader
   * @return The recaptcha wrapper.
   */
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  public static load(siteKey: string, options: IReCaptchaLoaderOptions = {}): Promise<ReCaptchaInstance> {
    // Browser environment
    if (typeof document === 'undefined') {
      return Promise.reject(new Error('This is a library for the browser!'))
    }

    // Check if grecaptcha is already registered.
    if (ReCaptchaLoader.getLoadingState() === ELoadingState.LOADED) {
      // Check if the site key is equal to the already loaded instance
      if (ReCaptchaLoader.instance.getSiteKey() === siteKey) {
        // Resolve existing instance
        return Promise.resolve(ReCaptchaLoader.instance)
      } else {
        // Reject because site keys are different
        return Promise.reject(new Error('reCAPTCHA already loaded with different site key!'))
      }
    }

    // If the recaptcha is loading add this loader to the queue.
    if (ReCaptchaLoader.getLoadingState() === ELoadingState.LOADING) {
      // Check if the site key is equal to the current loading site key
      if (siteKey !== ReCaptchaLoader.instanceSiteKey) {
        return Promise.reject(new Error('reCAPTCHA already loaded with different site key!'))
      }

      return new Promise<ReCaptchaInstance>((resolve, reject) => {
        ReCaptchaLoader.successfulLoadingConsumers.push((instance: ReCaptchaInstance) => resolve(instance))
        ReCaptchaLoader.errorLoadingRunnable.push((reason: Error) => reject(reason))
      })
    }

    // Set states
    ReCaptchaLoader.instanceSiteKey = siteKey
    ReCaptchaLoader.setLoadingState(ELoadingState.LOADING)

    // Throw error if the recaptcha is already loaded
    const loader = new ReCaptchaLoader()
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      loader.loadScript(
          siteKey,
          options.useRecaptchaNet || false,
          options.renderParameters ? options.renderParameters : {},
          options.customUrl,
          options.scriptElementAttributes !== undefined ? options.scriptElementAttributes : {'recaptcha-v3-script': '', 'defer': ''}
      ).then(() => {
        ReCaptchaLoader.setLoadingState(ELoadingState.LOADED)

        // Render the ReCaptcha widget.
        const widgetID = loader.doExplicitRender(grecaptcha, siteKey, options.explicitRenderParameters ? options.explicitRenderParameters : {})

        const instance = new ReCaptchaInstance(siteKey, widgetID, grecaptcha)
        ReCaptchaLoader.successfulLoadingConsumers.forEach((v) => v(instance))
        ReCaptchaLoader.successfulLoadingConsumers = []

        // Check for auto hide badge option
        if (options.autoHideBadge) {
          instance.hideBadge()
        }

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

  /**
   * Will set the loading state of the recaptcha script.
   *
   * @param state New loading state for the loading process.
   */
  private static setLoadingState(state: ELoadingState): void {
    ReCaptchaLoader.loadingState = state
  }

  /**
   * Will return the current loading state. If no loading state is globally set
   * the NO_LOADED state is set as default.
   */
  private static getLoadingState(): ELoadingState {
    if (ReCaptchaLoader.loadingState === null) {
      return ELoadingState.NOT_LOADED
    } else {
      return ReCaptchaLoader.loadingState
    }
  }

  /**
   * The actual method that loads the script.
   * This method will create a new script element
   * and append it to the "<head>" element.
   *
   * @param siteKey The site key to load the library with.
   * @param useRecaptchaNet If the loader should use "recaptcha.net" instead of "google.com"
   * @param renderParameters Additional parameters for reCAPTCHA.
   * @param customUrl If the loader custom URL instead of the official recaptcha URLs
   * @param scriptElementAttributes Additional attributes for the reCAPTCHA script tag
   */
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  private loadScript(siteKey: string, useRecaptchaNet = false,
                     renderParameters: { [key: string]: string } = {},
                     customUrl = '',
                     scriptElementAttributes: { [key: string]: string } = {}): Promise<HTMLScriptElement> {
    // Create script element
    const scriptElement: HTMLScriptElement = document.createElement('script')

    // Set the additional attributes
    for (const attrName of Object.keys(scriptElementAttributes)) {
      scriptElement.setAttribute(attrName, scriptElementAttributes[attrName])
    }

    let scriptBase = 'https://www.google.com/recaptcha/api.js'
    if (useRecaptchaNet) {
      scriptBase = 'https://recaptcha.net/recaptcha/api.js'
    }
    if (customUrl) {
      scriptBase = customUrl
    }

    // Remove the 'render' property.
    if (renderParameters.render) {
      renderParameters.render = undefined
    }

    // Build parameter query string
    const parametersQuery = this.buildQueryString(renderParameters)

    scriptElement.src = scriptBase + '?render=explicit' + parametersQuery

    return new Promise<HTMLScriptElement>((resolve, reject) => {
      scriptElement.addEventListener('load', this.waitForScriptToLoad(() => {
        resolve(scriptElement)
      }), false)
      scriptElement.onerror = (error): void => {
        ReCaptchaLoader.setLoadingState(ELoadingState.NOT_LOADED)
        reject(error)
      }
      document.head.appendChild(scriptElement)
    })
  }

  /**
   * Will build a query string from the given parameters and return
   * the built string. If parameters has no keys it will just return
   * an empty string.
   *
   * @param parameters Object to build query string from.
   */
  private buildQueryString(parameters: { [key: string]: string }): string {
    const parameterKeys = Object.keys(parameters)

    // If there are no parameters just return an empty string.
    if (parameterKeys.length < 1) {
      return ''
    }

    // Build the actual query string (KEY=VALUE).
    return '&' + Object.keys(parameters)
      .filter((parameterKey) => {
        return !!parameters[parameterKey]
      })
      .map((parameterKey) => {
        return parameterKey + '=' + parameters[parameterKey]
      }).join('&')
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
    return (): void => {
      if (window.grecaptcha === undefined) {
        setTimeout(() => {
          this.waitForScriptToLoad(callback)
        }, ReCaptchaLoader.SCRIPT_LOAD_DELAY)
      } else {
        window.grecaptcha.ready(() => {
          callback()
        })
      }
    }
  }

  /**
   * Will render explicitly render the ReCaptcha.
   * @param grecaptcha The grecaptcha instance to use for the rendering.
   * @param siteKey The sitekey to render.
   * @param parameters The parameters for the rendering process.
   * @return The id of the rendered widget.
   */
  private doExplicitRender(grecaptcha: IReCaptchaInstance, siteKey: string, parameters: IReCaptchaExplicitRenderParameters): string {
    // Split the given parameters into a matching interface for the grecaptcha.render function.
    const augmentedParameters: IRenderParameters = {
      sitekey: siteKey,
      badge: parameters.badge,
      size: parameters.size,
      tabindex: parameters.tabindex
    }

    // Differ if an explicit container element is given.
    if (parameters.container) {
      return grecaptcha.render(parameters.container, augmentedParameters)
    } else {
      return grecaptcha.render(augmentedParameters)
    }
  }
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
  useRecaptchaNet?: boolean;

  /**
   * Will automatically hide the badge after loading
   * recaptcha. Warning: The usage of this option is only
   * allowed if you follow the official guide for hiding
   * the badge from Google:
   * https://developers.google.com/recaptcha/docs/faq#id-like-to-hide-the-recaptcha-v3-badge-what-is-allowedl
   */
  autoHideBadge?: boolean;

  /**
   * Defines additional parameters for the rendering process.
   * The parameters should be defined as key/value pair.
   *
   * Known possible parameters:
   * `hl` -> Will set the language of the badge.
   */
  renderParameters?: { [key: string]: string };

  /**
   * Defines the additional parameters for the explicit rendering process.
   */
  explicitRenderParameters?: IReCaptchaExplicitRenderParameters;

  /**
   * Defines a custom url for ReCaptcha JS file.
   * Useful when self hosting or proxied ReCaptcha JS file.
   * https://github.com/AurityLab/recaptcha-v3/issues/76
   */
  customUrl?: string;

  /**
   * Defines additional attributes on the recaptcha <script> element.
   */
  scriptElementAttributes?: { [key: string]: string };
}

/**
 * Describes the parameters for the explicit rendering call. This gives the possibility to set explicit positioning
 * for the badge.
 */
export interface IReCaptchaExplicitRenderParameters {
  container?: string | Element;
  badge?: 'bottomright' | 'bottomleft' | 'inline';
  size?: 'invisible';
  tabindex?: number;
}

/**
 * Only export the recaptcha load and getInstance method to
 * avoid confusion with the class constructor.
 */
export const load = ReCaptchaLoader.load
export const getInstance = ReCaptchaLoader.getInstance
