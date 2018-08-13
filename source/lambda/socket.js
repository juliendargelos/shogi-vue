var grip = require('grip');
var faas_grip = require('faas-grip');

exports.handler = function(event, context, callback) {
  var ws;
  try {
    ws = faas_grip.lambdaGetWebSocket(event);
  }
  catch(err) {
    callback(null, {
      statusCode: 400,
      headers: {'Content-Type': 'text/plain'},
      body: 'Not a WebSocket-over-HTTP request\n'
    });

    return;
  }

  // if this is a new connection, accept it
  if(ws.isOpening()) {
    ws.accept();
  }

  // here we loop over any messages
  while(ws.canRecv()) {
    var message = ws.recv();

    // if return value is null, then the connection is closed
    if(message === null) {
      ws.close();
      break;
    }

    // echo the message
    ws.send(message);
  }

  callback(null, ws.toResponse());
};
