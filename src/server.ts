import { server as WebSocketServer, connection } from 'websocket';
import net from 'net';
import fs from 'fs';
import config from './config';
import { originIsAllowed } from './utils';
import { logger } from './logger';

const createIndexFile = () => {
  const protocol = config.ssl.enabled ? 'wss' : 'ws';
  const url = `${protocol}://${config.server.address}:${config.server.websocketPort}`;
  const output =
    '<!DOCTYPE html>\n' +
    '<html>\n' +
    '    <head>\n' +
    '        <title>Example of a user defined function (UDF) in MySQL</title>\n' +
    '        <meta charset="UTF-8">\n' +
    '        <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '        <script>\n' +
    '        document.addEventListener("DOMContentLoaded", function(event) {\n' +
    '          const ws = new WebSocket("' +
    url +
    '", "echo-protocol");\n' +
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
};

export const run = async () => {
  // keeps track of all connected clients
  const connections: connection[] = [];

  let credentials = {};

  if (config.ssl.enabled) {
    if (!config.ssl.key || !config.ssl.cert) {
      logger.error('You need to specify a ssl key and certificate.');
      process.exit(-1);
    }
    const privateKey = fs.readFileSync(config.ssl.key, 'utf8');
    const certificate = fs.readFileSync(config.ssl.cert, 'utf8');

    credentials = {
      key: privateKey,
      cert: certificate,
    };
  }

  // create our index.html file
  createIndexFile();

  // create a listening socket which listens for data sent from our UDF
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
      sock.on('error', (error) => {});
    })
    .on('error', (error) => {
      logger.error(error);
      process.exit(-1);
    })
    .listen(config.server.port, config.server.address, () => {
      logger.info(
        `Socket server is listening on: ${config.server.address}:${config.server.port}`
      );
    });

  import(`${config.ssl.enabled ? 'https' : 'http'}`).then((http) => {
    // create a http server
    const httpServer = http
      .createServer(credentials, (req: any, res: any) => {
        fs.readFile(__dirname + '/../' + req.url, function (err, data) {
          if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
          }
          res.writeHead(200);
          res.end(data);
        });
      })
      .on('error', (error: any) => {
        logger.error(error);
        process.exit(-1);
      })
      .listen(config.server.websocketPort, config.server.address, () => {
        logger.info(
          `Http server is listening on: ${config.server.address}:${config.server.websocketPort}`
        );
      });

    const wsServer = new WebSocketServer({
      httpServer,
      // You should not use autoAcceptConnections for production
      // applications, as it defeats all standard cross-origin protection
      // facilities built into the protocol and the browser.  You should
      // *always* verify the connection's origin and decide whether or not
      // to accept it.
      autoAcceptConnections: config.autoAcceptConnections,
    });

    wsServer.on('request', (req) => {
      const url = new URL(req.origin);
      if (!originIsAllowed(url.hostname)) {
        // Make sure we only accept requests from an allowed origin
        req.reject();
        logger.warn(`Connection from origin ${req.origin} rejected.`);
        return;
      }
      const con = req
        .accept('echo-protocol', req.origin)
        .on('message', function (this: connection, message) {
          if (message.type === 'utf8') {
            logger.debug(`Received Message: ${message.utf8Data}`);
            this.sendUTF(message.utf8Data);
          } else if (message.type === 'binary') {
            logger.debug(
              `Received Binary Message of ${message.binaryData.length} bytes`
            );
            this.sendBytes(message.binaryData);
          }
        })
        .on('close', function (this: connection, reasonCode, description) {
          const index = connections.indexOf(this);
          // TODO: Do we need to close the connection
          // connections[index].close();
          connections.splice(index, 1);
          logger.debug(`Peer ${this.remoteAddress} disconnected.`);
        });
      connections.push(con);
    });
  });
};
