/* eslint-disable no-unused-expressions,@typescript-eslint/no-floating-promises */
import {ReCaptchaInstance} from '../../src/ReCaptchaInstance'
import {getInstance, load} from '../../src/ReCaptchaLoader'

const testingSiteKey = '6LfC6HgUAAAAAEtG92bYRzwYkczElxq7WkCoG4Ob'

describe('ReCaptchaLoader', () => {
  it('should load recaptcha', async () => {
    const result = await load(testingSiteKey)

    expect(result).not.null
  })

  it('should load get instance', async () => {
    const result = await load(testingSiteKey)

    expect(result).not.null

    const getInstanceResult = getInstance()
    expect(getInstanceResult).not.null
    expect(getInstanceResult).is.eq(result)
  })

  describe('Action execution', () => {
    let recaptchaInst: ReCaptchaInstance = null

    before(async () => {
      recaptchaInst = await load(testingSiteKey)
    })

    it('should execute action correctly', async () => {
      const response = await recaptchaInst.execute('test')

      expect(response).not.null
      expect(response).to.be.a('string')
    })

    it('should execution null action correctly', async () => {
      const response = await recaptchaInst.execute(null)

      expect(response).not.null
      expect(response).to.be.a('string')
      console.log(response)
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
      await load(testingSiteKey)

      try {
        await load('asdf')
      } catch (e) {
        expect(e).not.null
      }
    })
  })

  describe('Synchronous loading', () => {
    it('should load recaptcha once', async () => {
      const instance = await load(testingSiteKey)

      expect(instance).not.null

      const secondInstance = await load(testingSiteKey)
      expect(secondInstance).not.null
      expect(secondInstance).to.eq(instance)
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

  describe('Explicit render parameters', () => {
    it('should load with `bottomleft` badge', async () => {
      const result = await load(testingSiteKey, {
        explicitRenderParameters: {
          badge: 'bottomleft'
        }
      })

      expect(result).not.null
    })

    it('should load with `bottomright` badge', async () => {
      const result = await load(testingSiteKey, {
        explicitRenderParameters: {
          badge: 'bottomright'
        }
      })

      expect(result).not.null
    })

    it('should load with `inline` badge', async () => {
      const result = await load(testingSiteKey, {
        explicitRenderParameters: {
          badge: 'inline'
        }
      })

      expect(result).not.null
    })

    it('should load with `inline` badge, `invisible` size', async () => {
      const result = await load(testingSiteKey, {
        explicitRenderParameters: {
          badge: 'inline',
          size: 'invisible'
        }
      })

      expect(result).not.null
    })
  })

  describe('Render parameters', () => {
    it('should load with `hl` parameter', async () => {
      const result = await load(testingSiteKey, {
        renderParameters: {
          hl: 'en'
        }
      })

      expect(result).not.null
    })
  })
})
