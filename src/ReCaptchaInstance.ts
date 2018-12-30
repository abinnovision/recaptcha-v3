import {IReCaptchaInstance} from './grecaptcha/grecaptcha'

/**
 * A simple wrapper for the "grecaptcha" object.
 *
 * Currently only wraps the "execute" function.
 */
export class ReCaptchaInstance {
  private readonly siteKey: string
  private readonly recaptcha: IReCaptchaInstance

  public constructor(siteKey: string, recaptcha: IReCaptchaInstance) {
    this.siteKey = siteKey
    this.recaptcha = recaptcha
  }

  /**
   * Will execute the recaptcha with the given action.
   *
   * @param action The action to execute with.
   */
  public async execute(action: string): Promise<string> {
    return this.recaptcha.execute(this.siteKey, {action})
  }

  /**
   * Hides all badges on the current page.
   *
   * Warning: The usage of this method is only allowed if you follow
   * the official guide for hiding the badge from Google:
   * https://developers.google.com/recaptcha/docs/faq#id-like-to-hide-the-recaptcha-v3-badge-what-is-allowedl
   */
  public hideBadge(): void {
    const badges = this.findBadges()

    badges.forEach((badge) => {
      badge.style.display = 'none'
    })
  }

  /**
   * Shows the badge again after hiding it.
   */
  public showBadge(): void {
    const badges = this.findBadges()

    badges.forEach((badge) => {
      badge.style.display = 'block'
    })
  }

  /**
   * Searches for all available reCAPTCHA badges
   * and returns them.
   *
   * @return All reCAPTCHA badges as an array.
   */
  private findBadges(): HTMLElement[] {
    const foundElements = Array.from(document.getElementsByClassName('grecaptcha-badge'))

    return foundElements.filter((value) => {
      return value instanceof HTMLElement
    }).map((value) => value as HTMLElement)
  }
}
