let originIsAllowed = (origin: string): boolean => false;

describe('test suite', () => {
    const setupOrigin = async (origin: string) => {
        jest.resetModules()
        process.env.ALLOWED_ORIGINS = origin
        const { originIsAllowed: method } = require('../src/utils')
        originIsAllowed = method
    }
    it('test wildcard in origin', async () => {
        await setupOrigin('*')
        expect(originIsAllowed('localhost')).toEqual(true)
    })
    it('test invalid origin', async () => {
        await setupOrigin('192.168.33.10')
        expect(originIsAllowed('localhost')).toEqual(false)
    })
    it('test valid origin', async () => {
        await setupOrigin('192.168.33.10')
        expect(originIsAllowed('192.168.33.10')).toEqual(true)
    })
    it('test multiple origins with wildcard', async () => {
        await setupOrigin('localhost, 127.0.0.1, *')
        expect(originIsAllowed('192.168.33.10')).toEqual(true)
    })
    it('test multiple origins with valid address', async () => {
        await setupOrigin('localhost, 127.0.0.1')
        expect(originIsAllowed('127.0.0.1')).toEqual(true)
    })
    it('test multiple origins with invalid address', async () => {
        await setupOrigin('localhost, 127.0.0.1')
        expect(originIsAllowed('192.168.33.10')).toEqual(false)
    })
    it ('test so multiple origins is trimmed', async () => {
        await setupOrigin('localhost,, 127.0.0.1,, ,')
        const { default: config }= require('../src/config')
        expect(config.allowedOrigins).toHaveLength(2)
    })
})
