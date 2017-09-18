var express = require('express');
var http = require('http');

// var app = express();
// var server = http.createServer(app);
// app.set('port', process.env.PORT || 8000);

http.createServer(function(request, response) {
  console.log('Server running at port 8888');
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello World");
  response.end();
}).listen(8888);

