declare global {
  const grecaptcha: IReCaptchaInstance
}

export interface IReCaptchaInstance {
  ready(callback: () => void): void
  execute(siteKey: string, options: IExecuteOptions): Promise<string>
}

export declare interface IExecuteOptions {
  action: string
}
