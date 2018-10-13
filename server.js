#!/usr/bin/env node
var WebSocketServer = require('websocket').server
var http = require('http')
var net = require('net')
var fs = require('fs')

var SERVER_PORT = 2048
var WEBSOCKET_PORT = 8080
var SERVER_ADDR = '127.0.0.1'
// keeps track of all connected clients
var connections = []

// parse any arguments
var argv = require('minimist')(process.argv.slice(2))

if (argv.p) {
  SERVER_PORT = argv.p
}
if (argv.w) {
  WEBSOCKET_PORT = argv.w
}
if (argv.h) {
  SERVER_ADDR = argv.h.replace(/['"]+/g, '')
}

// create a listening socket
net.createServer(function (sock) {
  sock.on('data', function (data) {
    sock.end()
    sock.destroy()

    // send data to all connected clients
    for (var i = 0; i < connections.length; i++) {
      connections[i].sendUTF(data)
    }
  })
  sock.on('close', function (data) {

  })
}).listen(SERVER_PORT, SERVER_ADDR)

// create a http server
var server = http.createServer(function (request, response) {
  console.log((new Date()) + ' Received request for ' + request.url)
  response.writeHead(404)
  response.end()
})
server.listen(WEBSOCKET_PORT, function () {
  console.log((new Date()) + ' Server is listening on port ' + SERVER_PORT)
})

var wsServer = new WebSocketServer({
  httpServer: server,
  // You should not use autoAcceptConnections for production
  // applications, as it defeats all standard cross-origin protection
  // facilities built into the protocol and the browser.  You should
  // *always* verify the connection's origin and decide whether or not
  // to accept it.
  autoAcceptConnections: false
})

function originIsAllowed (origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true
}

function createTemplate () {
  var output = '<!DOCTYPE html>\n' +
        '<html>\n' +
        '    <head>\n' +
        '        <title>Example of a user defined function (UDF) in MySQL</title>\n' +
        '        <meta charset="UTF-8">\n' +
        '        <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
        '        <script\n' +
        '                src="https://code.jquery.com/jquery-3.3.1.slim.min.js"\n' +
        '                integrity="sha256-3edrmyuQ0w65f8gfBsqowzjJe2iM6n0nKciPUp8y+7E="\n' +
        '                crossorigin="anonymous"></script>\n' +
        '        <script>\n' +
        '            $(document).ready(function() {\n' +
        '               var ws = new WebSocket(\'ws://' + SERVER_ADDR + ':' + WEBSOCKET_PORT + '\', \'echo-protocol\');\n' +
        '               ws.onmessage = function(event) {\n' +
        '                   $(\'body\').append(event.data + "<br />");\n' +
        '               };\n' +
        '            });\n' +
        '        </script>\n' +
        '    </head>\n' +
        '    <body>\n' +
        '    </body>\n' +
        '</html>'

  fs.writeFile('./index.html', output, function (err) {
    if (err) {
      return console.log(err)
    }
    console.log('Creating index.html file.')
  })
}

if (!fs.existsSync('./index.html')) {
  createTemplate()
}

wsServer.on('request', function (request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject()
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.')
    return
  }
  var connection = request.accept('echo-protocol', request.origin)
  connections.push(connection)
  connection.on('message', function (message) {
    if (message.type === 'utf8') {
      console.log('Received Message: ' + message.utf8Data)
      connection.sendUTF(message.utf8Data)
    } else if (message.type === 'binary') {
      console.log('Received Binary Message of ' + message.binaryData.length + ' bytes')
      connection.sendBytes(message.binaryData)
    }
  })
  connection.on('close', function (reasonCode, description) {
    var index = connections.indexOf(this)
    connections.splice(index, 1)
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.')
  })
})
