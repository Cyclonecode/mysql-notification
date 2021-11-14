import dotenv from 'dotenv';
import { server as WebSocketServer, connection } from 'websocket';
import net from 'net';
import fs from 'fs';
import { logger } from './logger';

dotenv.config();

// keeps track of all connected clients
const connections: connection[] = [];

// load configuration
const config = Object.assign({}, process.env);

const SERVER_PORT = parseInt(config.SERVER_PORT || '', 10) || 2048;
const WEBSOCKET_PORT = parseInt(config.WEBSOCKET_PORT || '', 10) || 80;
const SERVER_ADDRESS = (config.SERVER_ADDRESS || '127.0.0.1').replace(
  /['"]+/g,
  ''
);
const AUTO_ACCEPT_CONNECTION = !!parseInt(
  config.AUTO_ACCEPT_CONNECTION || '',
  10
);
const ALLOWED_ORIGINS = config.ALLOWED_ORIGINS
  ? config.ALLOWED_ORIGINS.replace(/\s/g, '')
      .toLowerCase()
      .split(',')
      .filter((it) => it !== '')
  : ['*'];
let credentials = {};

if (parseInt(config.SSL_ENABLED || '')) {
  if (!config.SSL_KEY || !config.SSL_CERTIFICATE) {
    logger.error('You need to specify a ssl key and certificate.');
    process.exit(-1);
  }
  const privateKey = fs.readFileSync(config.SSL_KEY, 'utf8');
  const certificate = fs.readFileSync(config.SSL_CERTIFICATE, 'utf8');

  credentials = {
    key: privateKey,
    cert: certificate,
  };
}

// create a listening socket
net
  .createServer((sock) => {
    sock.on('data', (data) => {
      sock.end();
      sock.destroy();
      // send data to all connected clients
      for (let i = 0; i < connections.length; i++) {
        connections[i].sendUTF(data);
      }
    });
    sock.on('close', (data) => {});
  })
  .listen(SERVER_PORT, SERVER_ADDRESS);

import(`${parseInt(config.SSL_ENABLED || '', 10) ? 'https' : 'http'}`).then(
  (http) => {
    // create a http server
    const server = http.createServer(credentials, (req: any, res: any) => {
      fs.readFile(__dirname + '/../' + req.url, function (err, data) {
        if (err) {
          res.writeHead(404);
          res.end(JSON.stringify(err));
          return;
        }
        res.writeHead(200);
        res.end(data);
      });
    });
    server.listen(WEBSOCKET_PORT, SERVER_ADDRESS, () => {
      logger.info(
        new Date() + ` Server is listening ${SERVER_ADDRESS}:${WEBSOCKET_PORT}`
      );
    });

    const wsServer = new WebSocketServer({
      httpServer: server,
      // You should not use autoAcceptConnections for production
      // applications, as it defeats all standard cross-origin protection
      // facilities built into the protocol and the browser.  You should
      // *always* verify the connection's origin and decide whether or not
      // to accept it.
      autoAcceptConnections: AUTO_ACCEPT_CONNECTION,
    });

    function originIsAllowed(origin: string) {
      return !!ALLOWED_ORIGINS.find(
        (it) => it === '*' || it === origin.toLowerCase()
      );
    }

    (() => {
      const protocol = parseInt(config.SSL_ENABLED || '') ? 'wss' : 'ws';
      const url = `${protocol}://${SERVER_ADDRESS}:${WEBSOCKET_PORT}`;
      const output =
        '<!DOCTYPE html>\n' +
        '<html>\n' +
        '    <head>\n' +
        '        <title>Example of a user defined function (UDF) in MySQL</title>\n' +
        '        <meta charset="UTF-8">\n' +
        '        <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
        '        <script>\n' +
        '        document.addEventListener("DOMContentLoaded", function(event) {\n' +
        '          const ws = new WebSocket(' + url + ', "echo-protocol");\n' +
        '          ws.onmessage = function(event) {\n' +
        '            document.body.innerHTML += event.data + "<br />";\n' +
        '          };\n' +
        '        })\n' +
        '        </script>\n' +
        '    </head>\n' +
        '    <body>\n' +
        '    </body>\n' +
        '</html>';
      fs.writeFile('index.html', output, (err) => {
        if (err) {
          return logger.error(err);
        }
        logger.info('Creating index.html file.');
      });
    })();

    wsServer.on('request', (req) => {
      const url = new URL(req.origin);
      if (!originIsAllowed(url.hostname)) {
        // Make sure we only accept requests from an allowed origin
        req.reject();
        logger.warn(
          new Date() + ` Connection from origin ${req.origin} rejected.`
        );
        return;
      }
      const connection = req.accept('echo-protocol', req.origin);
      connections.push(connection);
      connection.on('message', (message) => {
        if (message.type === 'utf8') {
          logger.debug(`Received Message: ${message.utf8Data}`);
          connection.sendUTF(message.utf8Data);
        } else if (message.type === 'binary') {
          logger.debug(
            `Received Binary Message of ${message.binaryData.length} bytes`
          );
          connection.sendBytes(message.binaryData);
        }
      });
      connection.on('close', function (reasonCode, description) {
        const index = connections.indexOf(connection);
        // TODO: Do we need to close the connection
        // connections[index].close();
        connections.splice(index, 1);
        logger.debug(
          new Date() + ` Peer ${connection.remoteAddress} disconnected.`
        );
      });
    });
  }
);
