#!/usr/bin/env node

var WebSocketServer = require('websocket').server;
var http = require('http');
var net = require('net');

// server port
var SERVER_PORT = 2048;
// websocket port
var WEBSOCKET_PORT = 8080
// server address
var SERVER_ADDR = '127.0.0.1';
// keeps track of all connected clients
var connections = [];

// create a listening socket
net.createServer(function(sock) {
    sock.on('data', function(data) {
        sock.end();
        sock.destroy();

        // send data to all connected clients
        for(var i = 0; i < connections.length; i++) {
            connections[i].sendUTF(data);
        }
    });
    sock.on('close', function(data) {

    });

}).listen(SERVER_PORT, SERVER_ADDR);

// create a http server 
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(WEBSOCKET_PORT, function() {
    console.log((new Date()) + ' Server is listening on port ' + SERVER_PORT);
});
 
wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production 
    // applications, as it defeats all standard cross-origin protection 
    // facilities built into the protocol and the browser.  You should 
    // *always* verify the connection's origin and decide whether or not 
    // to accept it. 
    autoAcceptConnections: false
});
 
function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed. 
  return true;
}
 
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin 
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    var connection = request.accept('echo-protocol', request.origin);
    connections.push(connection);
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
