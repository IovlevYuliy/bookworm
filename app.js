var express = require('express');

var server = http.createServer(app);

server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
