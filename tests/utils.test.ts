let originIsAllowed = (origin: string): boolean => false;

describe('utility test suite', () => {
    beforeEach(() => {
        jest.resetModules()
    })
    const setupOrigin = async (origin: string) => {
        process.env.ALLOWED_ORIGINS = origin
        const { originIsAllowed: method } = require('../src/utils')
        originIsAllowed = method
    }
    it('test wildcard in origin', async () => {
        process.env.ALLOWED_ORIGINS = '*'
        const { originIsAllowed } = jest.requireActual('../src/utils')
        expect(originIsAllowed('localhost')).toEqual(true)
    })
    it('test invalid origin', async () => {
        process.env.ALLOWED_ORIGINS = '192.168.33.10'
        const { originIsAllowed } = jest.requireActual('../src/utils')
        expect(originIsAllowed('localhost')).toEqual(false)
    })
    it('test valid origin', async () => {
        process.env.ALLOWED_ORIGINS = '192.168.33.10'
        const { originIsAllowed } = jest.requireActual('../src/utils')
        expect(originIsAllowed('192.168.33.10')).toEqual(true)
    })
    it('test multiple origins with wildcard', async () => {
        process.env.ALLOWED_ORIGINS = 'localhost, 127.0.0.1, *'
        const { originIsAllowed } = jest.requireActual('../src/utils')
        expect(originIsAllowed('192.168.33.10')).toEqual(true)
    })
    it('test multiple origins with valid address', async () => {
        process.env.ALLOWED_ORIGINS = 'localhost, 127.0.0.1'
        const { originIsAllowed } = jest.requireActual('../src/utils')
        expect(originIsAllowed('127.0.0.1')).toEqual(true)
    })
    it('test multiple origins with invalid address', async () => {
        process.env.ALLOWED_ORIGINS = 'localhost, 127.0.0.1'
        const { originIsAllowed } = jest.requireActual('../src/utils')
        expect(originIsAllowed('192.168.33.10')).toEqual(false)
    })
})
