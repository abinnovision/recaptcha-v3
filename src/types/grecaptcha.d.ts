declare let grecaptcha: IReCaptchaInstance

declare interface IReCaptchaInstance {
  ready(callback: () => void): void
  execute(siteKey: string, options: IExecuteOptions): Promise<string>
}

declare interface IExecuteOptions {
  action: string
}
