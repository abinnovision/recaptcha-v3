import {IReCaptchaInstance} from './grecaptcha/grecaptcha'

/**
 * A simple wrapper for the "grecaptcha" object.
 *
 * Currently only wraps the "execute" function.
 */
export class ReCaptchaInstance {
  private readonly siteKey: string
  private readonly recaptchaID: string
  private readonly recaptcha: IReCaptchaInstance
  private styleContainer: HTMLStyleElement

  public constructor(siteKey: string, recaptchaID: string, recaptcha: IReCaptchaInstance) {
    this.siteKey = siteKey
    this.recaptchaID = recaptchaID
    this.recaptcha = recaptcha
    this.styleContainer = null
  }

  /**
   * Will execute the recaptcha with the given action.
   *
   * @param action The action to execute with.
   */
  public async execute(action?: string): Promise<string> {
    return this.recaptcha.enterprise ? this.recaptcha.enterprise.execute(this.recaptchaID, {action}) :  this.recaptcha.execute(this.recaptchaID, {action})
  }

  /**
   * Will return the site key, with which the reCAPTCHA
   * has been initialized.
   */
  public getSiteKey(): string {
    return this.siteKey
  }

  /**
   * Hides all badges on the current page.
   *
   * Warning: The usage of this method is only allowed if you follow
   * the official guide for hiding the badge from Google:
   * https://developers.google.com/recaptcha/docs/faq#id-like-to-hide-the-recaptcha-v3-badge-what-is-allowedl
   */
  public hideBadge(): void {
    if (this.styleContainer !== null) {
      return
    }

    this.styleContainer = document.createElement('style')
    this.styleContainer.innerHTML = '.grecaptcha-badge{visibility:hidden !important;}'
    document.head.appendChild(this.styleContainer)
  }

  /**
   * Shows the badge again after hiding it.
   */
  public showBadge(): void {
    if (this.styleContainer === null) {
      return
    }

    document.head.removeChild(this.styleContainer)
    this.styleContainer = null
  }
}
