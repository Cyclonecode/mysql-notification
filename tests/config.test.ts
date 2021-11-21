describe('test suite for configuration', () => {
    beforeEach(() => {
        jest.resetModules()
    })
    it('test invalid server port', async () => {
        process.env.SERVER_PORT = 'string'
        const { default: config } = require('../src/config')
        expect(config.server.port).toBe(2048)
    })
    it('test valid server port', async () => {
        process.env.SERVER_PORT = '3000'
        const { default: config } = require('../src/config')
        expect(config.server.port).toBe(3000)
    })
    it('test missing server port', async () => {
        process.env.SERVER_PORT = undefined
        const { default: config } = require('../src/config')
        expect(config.server.port).toBe(2048)
    })
    it('test invalid websocket port', async () => {
        process.env.WEBSOCKET_PORT = 'invalid'
        const { default: config } = require('../src/config')
        expect(config.server.websocketPort).toBe(80)
    })
    it('test valid websocket port', async () => {
        process.env.WEBSOCKET_PORT = '3001'
        const { default: config } = require('../src/config')
        expect(config.server.websocketPort).toBe(3001)
    })
    it('test missing websocket port', async () => {
        process.env.WEBSOCKET_PORT = undefined
        const { default: config } = require('../src/config')
        expect(config.server.websocketPort).toBe(80)
    })
})
