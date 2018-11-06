/**
 * A simple wrapper for the "grecaptcha" object.
 *
 * Currently only wraps the "execute" function.
 */
export class ReCaptcha {
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
}
