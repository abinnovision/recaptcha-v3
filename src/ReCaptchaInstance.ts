import {IReCaptchaInstance} from './grecaptcha/grecaptcha'

/**
 * A simple wrapper for the "grecaptcha" object.
 *
 * Currently only wraps the "execute" function.
 */
export class ReCaptchaInstance {
  private readonly siteKey: string
  private readonly recaptcha: IReCaptchaInstance
  private styleContainer: HTMLStyleElement

  public constructor(siteKey: string, recaptcha: IReCaptchaInstance) {
    this.siteKey = siteKey
    this.recaptcha = recaptcha
    this.styleContainer = null
  }

  /**
   * Will execute the recaptcha with the given action.
   *
   * @param action The action to execute with.
   */
  public execute(action: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.recaptcha.execute(this.siteKey, {action}).then(resolve, reject)
    })
  }

  /**
   * Hides all badges on the current page.
   *
   * Warning: The usage of this method is only allowed if you follow
   * the official guide for hiding the badge from Google:
   * https://developers.google.com/recaptcha/docs/faq#id-like-to-hide-the-recaptcha-v3-badge-what-is-allowedl
   */
  public hideBadge(): void {
    if (this.styleContainer !== null)
      return

    this.styleContainer = document.createElement('style')
    this.styleContainer.innerHTML = '.grecaptcha-badge{display:none;}'
    document.head.appendChild(this.styleContainer)
  }

  /**
   * Shows the badge again after hiding it.
   */
  public showBadge(): void {
    if (this.styleContainer === null)
      return

    document.head.removeChild(this.styleContainer)
    this.styleContainer = null
  }
}
