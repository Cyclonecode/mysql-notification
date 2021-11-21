import dotenv from 'dotenv';
dotenv.config();

interface Configuration {
    db: {
        host: string,
        name: string,
        username: string,
        password: string,
        port: number,
    },
    allowedOrigins: string[],
    autoAcceptConnections: boolean,
    server: {
        port: number,
        address: string,
        websocketPort: number,
    },
    ssl: {
        enabled: boolean,
        key: string | undefined,
        cert: string | undefined,
    },
}

const origins = process?.env?.ALLOWED_ORIGINS?.replace(/\s/g, '')
    .toLowerCase()
    .split(',')
    .filter((it) => it !== '') || []

const config: Configuration = {
    allowedOrigins: origins.length ? Array.from(new Set(origins)) : ['*'],
    db: {
        username: process.env.MYSQL_USERNAME || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        name: process.env.MYSQL_DATABASE || 'mysql_note',
        host: process.env.MYSQL_HOSTNAME || 'localhost',
        port: parseInt(process.env.MYSQL_PORT || '3306', 10) || 3306,
    },
    autoAcceptConnections: !!parseInt(
        process.env.AUTO_ACCEPT_CONNECTION || '',
        10
    ) || false,
    server: {
        port: parseInt(process.env.SERVER_PORT || '2048', 10) || 2048,
        address: (process.env.SERVER_ADDRESS || '127.0.0.1').replace(
            /['"]+/g,
            ''
        ),
        websocketPort: parseInt(process.env.WEBSOCKET_PORT || '80', 10) || 80,
    },
    ssl: {
        enabled: !!parseInt(process.env.SSL_ENABLED || '1', 10) || false,
        key: process.env.SSL_KEY,
        cert: process.env.SSL_CERTIFICATE,
    }
}

export default config
