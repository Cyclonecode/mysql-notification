describe('test suite for configuration', () => {
    const net = require('net')

    beforeEach(() => {
        jest.resetModules()
    })
    it('test invalid server port', async () => {
        process.env.SERVER_PORT = 'string'
        const { default: config } = jest.requireActual('../src/config')
        expect(config.server.port).toBe(2048)
    })
    it('test valid server port', async () => {
        process.env.SERVER_PORT = '3000'
        const { default: config } = jest.requireActual('../src/config')
        expect(config.server.port).toBe(3000)
    })
    it('test missing server port', async () => {
        process.env.SERVER_PORT = undefined
        const { default: config } = jest.requireActual('../src/config')
        expect(config.server.port).toBe(2048)
    })
    it('test invalid websocket port', async () => {
        process.env.WEBSOCKET_PORT = 'invalid'
        const { default: config } = jest.requireActual('../src/config')
        expect(config.server.websocketPort).toBe(80)
    })
    it('test valid websocket port', async () => {
        process.env.WEBSOCKET_PORT = '3001'
        const { default: config } = jest.requireActual('../src/config')
        expect(config.server.websocketPort).toBe(3001)
    })
    it('test missing websocket port', async () => {
        process.env.WEBSOCKET_PORT = undefined
        const { default: config } = jest.requireActual('../src/config')
        expect(config.server.websocketPort).toBe(80)
    })
    it('test so ssl enabled is set to false', () => {
        process.env.SSL_ENABLED = 'foo'
        const { default: config } = jest.requireActual('../src/config')
        expect(config.ssl.enabled).toBe(false)
    })
    it('test so ssl can be enabled', () => {
        process.env.SSL_ENABLED = '1'
        const { default: config } = jest.requireActual('../src/config')
        expect(config.ssl.enabled).toBe(true)
    })
    it('test so server address is ip', () => {
        process.env.SERVER_ADDRESS = '127.0.0.1'
        const { default: config } = jest.requireActual('../src/config')
        expect(net.isIPv4(config.server.address)).toBe(true)
    })
    it ('test so multiple origins is trimmed', async () => {
        process.env.ALLOWED_ORIGINS = 'localhost,, 127.0.0.1,, ,'
        const { default: config }= jest.requireActual('../src/config')
        expect(config.allowedOrigins).toHaveLength(2)
    })
    it ('test so duplicate origins is removed', async () => {
        process.env.ALLOWED_ORIGINS = 'localhost,127.0.0.1,localhost,192.168.33.10'
        const { default: config }= jest.requireActual('../src/config')
        expect(config.allowedOrigins).toHaveLength(3)
    })
})
