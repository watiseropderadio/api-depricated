var pg = require('pg');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.set('database', (process.env.PG_CONNECTION_STRING || false));
app.set('port', (process.env.PORT || 5000));
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

function sendJson(res, rootName, object) {
  var json = {};
  if (typeof object === 'object' && Object.keys(object).length) {
    json[rootName] = object;
  } else if (typeof object === 'boolean') {
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
  var limit = (req.query.limit <= process.env.LIMIT_MAX && req.query.limit > 0) ? req.query.limit : 20;

  knex.select('on_air', 'radio_id', 'song_id')
    .from('timeline_items')
    .where(where)
    .limit(limit)
    .then(function(rows) {
      sendJson(res, 'timeline_items', rows);
    })
    .catch(function(e) {
      console.error(e);
    });
});

app.post('/timeline_items', function(req, res) {

  var required = [];
  if (!req.body.timeline_item.radio_id) {
    required.push('radio_id');
  }
  if (!req.body.timeline_item.artist_name) {
    required.push('artist_name');
  }
  if (!req.body.timeline_item.song_title) {
    required.push('song_title');
  }

  if (required.length > 0) {
    return sendJson(res, 'errors', {
      required_fields: required
    })
  }

  knex('timeline_items').insert({
    radio_id: req.body.timeline_item.radio_id,
    artist_name: req.body.timeline_item.artist_name,
    song_title: req.body.timeline_item.song_title
  })
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
  }
  console.log('Node app is running at localhost:' + app.get('port'));
});
