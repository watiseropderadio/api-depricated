var pg = require('pg');
var express = require('express');
var app = express();

app.set('database', (process.env.PG_CONNECTION_STRING || false));
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(function(req, res, next) {
  res.removeHeader('X-Powered-By');
  res.header('Content-Type', 'application/json');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

function sendJson(res, rootName, object) {
  var json = {};
  if (Object.keys(object).length) {
    json[rootName] = object;
  } else {
    res.status(404);
    json[rootName] = [];
  }
  res.send(JSON.stringify(json));
}

var knex = require('knex')({
  client: 'pg',
  connection: app.get('database')
});

app.get('/', function(req, res) {
  res.send(JSON.stringify({
    author: 'Adriaan van Rossum',
    email: 'api@watiseropderadio.nl',
    website: 'http://watiseropderadio.nl'
  }));
});

app.get('/timeline_items', function(req, res) {

  var where = (req.query.radio_id) ? {
    radio_id: req.query.radio_id
  } : {};

  knex.select('on_air', 'radio_id', 'song_id')
    .from('timeline')
    .where(where)
    .limit(20)
    .then(function(rows) {
      sendJson(res, 'timeline_items', rows);
    })
    .catch(function(e) {
      console.error(e);
    });
});

app.listen(app.get('port'), function() {

  if (!app.get('database')) {
    console.error('PG_CONNECTION_STRING is not available');
  } else {
    console.log('PG_CONNECTION_STRING is:', app.get('database'));
  }

  console.log('Node app is running at localhost:' + app.get('port'));
});
