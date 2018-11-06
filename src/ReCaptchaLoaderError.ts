export class ReCaptchaLoaderError extends Error {
  public static alreadyLoadedError(): ReCaptchaLoaderError {
    return new ReCaptchaLoaderError('ReCaptcha already loaded!')
  }
  constructor(message: string) {
    super(message)
  }
}
