var express = require('express');
var port = process.env.PORT || 5000;
var pjson = require('./package.json');

// Setup
var database = require('./initializers/mongoose');
var server = require('./initializers/server')(express);
var router = require('./router')(server, database);

// Error Handling
server.use(function(err, req, res, next) {
  res.status(err.status || 500);
});

// Return info when no route is specified
server.get('/', function(req, res, next) {
  res.send({
    description: pjson.description || '',
    version: pjson.version || ''
  });
});

// Start listening!
server.listen(port, function() {
  console.log('App is running at http://localhost:' + port);
});

module.exports = server;
