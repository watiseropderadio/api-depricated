/* jslint white: true, unparam: true */

'use strict';

/**
 * Module dependencies.
 */

var pg = require('pg');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.set('database', (process.env.PG_CONNECTION_STRING || false));
app.set('debug', (process.env.DEBUG === 'true' || process.env.DEBUG === true) ? true : false);
app.set('port', (process.env.PORT || 5000));

/**
 * Middlewares.
 */

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(function(req, res, next) {
  res.removeHeader('X-Powered-By');
  res.header('Content-Type', 'application/vnd.api+json');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

/**
 * Connect to the database.
 */

var knex = require('knex')({
  client: 'pg',
  connection: app.get('database'),
  debug: app.get('debug'),
  timezone: 'UTC'
});

/**
 * Routes.
 */

var index = require('./routes/index');
var timelineItems = require('./routes/timeline-items');

module.exports = app;

app.all('*', function(req, res, next) {
  req.knex = knex;
  next();
});

app.get('/', index.list);
app.get('/timeline_items', timelineItems.list);
app.post('/timeline_items', timelineItems.add);

/**
 * Init app.
 */

/* istanbul ignore next */
if (!module.parent) {
  app.listen(app.get('port'), function() {
    if (!app.get('database')) {
      console.error('PG_CONNECTION_STRING is not available');
    }
    console.log('Node app is running at localhost:' + app.get('port'));
  });
}
