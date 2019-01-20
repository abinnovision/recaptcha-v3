/* tslint:disable:no-unused-expression */
import {IReCaptchaInstance} from '../../src/grecaptcha/grecaptcha'
import {ReCaptchaInstance} from '../../src/ReCaptchaInstance'
import {load} from '../../src/ReCaptchaLoader'

describe('ReCaptchaLoader', () => {
  it('should load recaptcha', () => {
    load('6LfC6HgUAAAAAEtG92bYRzwYkczElxq7WkCoG4Ob').then((value) => {
      expect(value).not.null
    })
  })

  describe('Action execution', () => {
    let recaptchaInst: ReCaptchaInstance = null

    before ((done) => {
      load('6LfC6HgUAAAAAEtG92bYRzwYkczElxq7WkCoG4Ob').then((value) => {
        recaptchaInst = value
        done()
      })
    })

    it ('should execute action correctly', () => {
      recaptchaInst.execute('test').then((response) => {
        expect(response).not.null
        expect(response).to.be.string
      })
    })
  })
})
