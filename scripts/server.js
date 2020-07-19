#!/usr/bin/env node
require('dotenv').config();
const WebSocketServer = require('websocket').server;
const net = require('net');
const fs = require('fs');
const logger = require('./logger');

// keeps track of all connected clients
let connections = [];

// load configuration
const config = Object.assign({}, process.env);

const http = require(parseInt(config.SSL_ENABLED) ? 'https' : 'http');
const SERVER_PORT = parseInt(config.SERVER_PORT || 2048);
const WEBSOCKET_PORT = parseInt(config.WEBSOCKET_PORT || 8080);
const SERVER_ADDR = (config.SERVER_ADDR || '127.0.0.1').replace(/['"]+/g, '');
const AUTO_ACCEPT_CONNECTION = parseInt(config.AUTO_ACCEPT_CONNECTION);
const ALLOWED_ORIGINS = config.ALLOWED_ORIGINS
  ? config.ALLOWED_ORIGINS.replace(/\s/g, '')
      .toLowerCase()
      .split(',')
      .filter((it) => it !== '')
  : ['*'];
let credentials = {};

if (parseInt(config.SSL_ENABLED)) {
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
  .listen(SERVER_PORT);

// create a http server
const server = http.createServer(credentials, (request, response) => {
  logger.debug(new Date() + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});
server.listen(WEBSOCKET_PORT, () => {
  logger.info(
    new Date() + ' Server is listening ' + SERVER_ADDR + ':' + WEBSOCKET_PORT,
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

function originIsAllowed(origin) {
  if (ALLOWED_ORIGINS[0] !== '*') {
    return ALLOWED_ORIGINS.find((it) => origin.toLowerCase() === it);
  }
  return true;
}

function createTemplate() {
  const protocol = parseInt(config.SSL_ENABLED) ? 'wss' : 'ws';
  const output =
    '<!DOCTYPE html>\n' +
    '<html>\n' +
    '    <head>\n' +
    '        <title>Example of a user defined function (UDF) in MySQL</title>\n' +
    '        <meta charset="UTF-8">\n' +
    '        <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '        <script\n' +
    '        src="https://code.jquery.com/jquery-3.5.1.slim.min.js"\n' +
    '        integrity="sha256-4+XzXVhsDmqanXGHaHvgh1gMQKX40OUvDEBTu8JcmNs="\n' +
    '        crossorigin="anonymous"></script>\n' +
    '        <script>\n' +
    '            $(document).ready(function() {\n' +
    "               var ws = new WebSocket('" +
    protocol +
    '://' +
    SERVER_ADDR +
    ':' +
    WEBSOCKET_PORT +
    "', 'echo-protocol');\n" +
    '               ws.onmessage = function(event) {\n' +
    '                   $(\'body\').append(event.data + "<br />");\n' +
    '               };\n' +
    '            });\n' +
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
}

if (!fs.existsSync('index.html')) {
  createTemplate();
}

wsServer.on('request', (request) => {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    logger.warn(
      new Date() + ' Connection from origin ' + request.origin + ' rejected.',
    );
    return;
  }
  const connection = request.accept('echo-protocol', request.origin);
  connections.push(connection);
  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      logger.debug('Received Message: ' + message.utf8Data);
      connection.sendUTF(message.utf8Data);
    } else if (message.type === 'binary') {
      logger.debug(
        'Received Binary Message of ' + message.binaryData.length + ' bytes',
      );
      connection.sendBytes(message.binaryData);
    }
  });
  connection.on('close', (reasonCode, description) => {
    const index = connections.indexOf(this);
    connections.splice(index, 1);
    logger.debug(
      new Date() + ' Peer ' + connection.remoteAddress + ' disconnected.',
    );
  });
});
