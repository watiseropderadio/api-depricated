// Load in the library
var Phobos = require('phobosjs');

// We have a schema that we should use
Phobos.addSchema(require('./config/schema'));

// The name of the schema/model that contains the scope field
Phobos.scopeCarrier('User', 'scope');

// Now for access control!
Phobos.addScopeManifest(require('./config/scopes'));

Phobos.addController(require('./controllers/tasks'));
Phobos.addController(require('./controllers/users'));

// Use the regular Express.js route API like so
Phobos.server.get('/', function(req, res, next) {
  res.send({
    api: 'Phobos.js Test API'
  });
});

// Let's start up our server!
Phobos.start();
