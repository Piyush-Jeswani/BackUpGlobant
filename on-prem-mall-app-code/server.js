'use strict';

var staticServer = require('node-static');

var fileServer = new staticServer.Server('./dist');

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    }).resume();
}).listen(process.env.PORT || 3333);

console.log("Server started");

