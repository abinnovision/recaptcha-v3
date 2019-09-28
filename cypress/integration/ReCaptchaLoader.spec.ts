/* eslint-disable no-unused-expressions,@typescript-eslint/no-floating-promises */
import { ReCaptchaInstance } from '../../src/ReCaptchaInstance'
import { getInstance, load } from '../../src/ReCaptchaLoader'

const testingSiteKey = '6LfC6HgUAAAAAEtG92bYRzwYkczElxq7WkCoG4Ob'

describe('ReCaptchaLoader', () => {
  it('should load recaptcha', () => {
    load(testingSiteKey).then((value) => {
      expect(value).not.null
    })
  })

  it('should load get instance', () => {
    load(testingSiteKey).then((value) => {
      expect(value).not.null

      const getInstanceResult = getInstance()
      expect(getInstanceResult).not.null
      expect(getInstanceResult).is.eq(value)
    })
  })

  describe('Action execution', () => {
    let recaptchaInst: ReCaptchaInstance = null

    before((done) => {
      load(testingSiteKey).then((value) => {
        recaptchaInst = value
        done()
      })
    })

    it('should execute action correctly', () => {
      recaptchaInst.execute('test').then((response) => {
        expect(response).not.null
        expect(response).to.be.string
      })
    })
  })

  describe('Simultaneous loading', () => {
    it('should load recaptcha once', async () => {
      const instances = await Promise.all([
        load(testingSiteKey),
        load(testingSiteKey)
      ])

      expect(instances).lengthOf(2)
      expect(instances[0]).not.null
      expect(instances[1]).not.null

      expect(instances[0]).to.eq(instances[1])
    })
    it('should throw an error, because of different site key', async () => {
      load(testingSiteKey)

      try {
        await load('asdf')
      } catch (e) {
        expect(e).not.null
      }
    })
  })

  describe('Synchronous loading', () => {
    it('should load recaptcha once', () => {
      load(testingSiteKey).then((instance) => {
        expect(instance).not.null

        load(testingSiteKey).then((secondInstance) => {
          expect(secondInstance).not.null
          expect(secondInstance).to.eq(instance)
        })
      })
    })

    it('should throw an error, because of different site key', async () => {
      await load(testingSiteKey)

      try {
        await load('asdf')
      } catch (e) {
        expect(e).not.null
      }
    })
  })
})
