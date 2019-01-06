#!/usr/bin/env node
const WebSocketServer = require('websocket').server
const http = require('http')
const net = require('net')
const fs = require('fs')

// keeps track of all connected clients
let connections = []

// parse any arguments
const argv = require('minimist')(process.argv.slice(2))

const SERVER_PORT = argv.port ? parseInt(argv.port) : 2048
const WEBSOCKET_PORT = argv.websocket ? parseInt(argv.websocket) : 8080
const SERVER_ADDR = argv.host ? argv.host.replace(/['"]+/g, '') : '127.0.0.1'

// create a listening socket
net.createServer((sock) => {
  sock.on('data', (data) => {
    sock.end()
    sock.destroy()

    // send data to all connected clients
    for (let i = 0; i < connections.length; i++) {
      connections[i].sendUTF(data)
    }
  })
  sock.on('close', (data) => {

  })
}).listen(SERVER_PORT)

// create a http server
const server = http.createServer((request, response) => {
  console.log((new Date()) + ' Received request for ' + request.url)
  response.writeHead(404)
  response.end()
})
server.listen(WEBSOCKET_PORT, () => {
  console.log((new Date()) + ' Server is listening on port ' + WEBSOCKET_PORT)
})

const wsServer = new WebSocketServer({
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

  fs.writeFile('index.html', output, (err) => {
    if (err) {
      return console.log(err)
    }
    console.log('Creating index.html file.')
  })
}

if (!fs.existsSync('index.html')) {
  createTemplate()
}

wsServer.on('request', (request) => {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject()
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.')
    return
  }
  var connection = request.accept('echo-protocol', request.origin)
  connections.push(connection)
  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      console.log('Received Message: ' + message.utf8Data)
      connection.sendUTF(message.utf8Data)
    } else if (message.type === 'binary') {
      console.log('Received Binary Message of ' + message.binaryData.length + ' bytes')
      connection.sendBytes(message.binaryData)
    }
  })
  connection.on('close', (reasonCode, description) => {
    let index = connections.indexOf(this)
    connections.splice(index, 1)
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.')
  })
})
