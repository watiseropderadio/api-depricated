var pg = require('pg');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var RSVP = require('rsvp');

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

  knex('timeline_items').select('on_air', 'radio_id', 'song_id')
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
  var invalid = [];
  var timeline_item = req.body.timeline_item;
  if (!timeline_item.radio_id) {
    required.push('radio_id');
  } else if (isNaN(parseInt(timeline_item.radio_id, 10))) {
    invalid.push('radio_id');
  } else {
    timeline_item.radio_id = parseInt(timeline_item.radio_id, 10);
  }
  if (!timeline_item.artist_name) {
    required.push('artist_name');
  }
  if (!timeline_item.song_title) {
    required.push('song_title');
  }

  if (required.length > 0 || invalid.length > 0) {
    return sendJson(res, 'errors', {
      required_fields: required,
      invalid_fields: invalid
    })
  }

  var timestamp = timeline_item.timestamp || null;

  processSong(timeline_item.radio_id, timeline_item.artist_name, timeline_item.song_title, timestamp).then(function(timeline_item) {
    return sendJson(res, 'timeline_item', timeline_item);
  }, function(errors) {
    return sendJson(res, 'errors', errors);
  });

});

app.listen(app.get('port'), function() {
  if (!app.get('database')) {
    console.error('PG_CONNECTION_STRING is not available');
  }
  console.log('Node app is running at localhost:' + app.get('port'));
});

var getArtistName = function(artist_name) {
  return new RSVP.Promise(function(resolve, reject) {
    knex('artist_names')
      .select('id', 'artist_id')
      .where({
        name: artist_name
      })
      .limit(1)
      .then(function(rows) {
        if (rows.length === 1) {
          return resolve({
            id: rows[0].id,
            artist_id: rows[0].artist_id
          });
        } else {
          knex('artist_names')
            .insert({
              artist_id: 0,
              name: artist_name
            }, 'id')
            .then(function(artist_name_ids) {
              return resolve({
                id: artist_name_ids[0],
                artist_id: 0
              });
            });
        }
      })
      .catch(function(e) {
        console.error(e);
        return reject(e);
      });
  });
};

var getArtist = function(artist_name_id, artist_id) {
  return new RSVP.Promise(function(resolve, reject) {

    // if there is an artist_id already, just resolve it
    if (artist_id > 0) {
      return resolve(artist_id);
    }

    // create artist and update artist_names record
    knex('artists')
      .insert({
        default_name_id: artist_name_id
      }, 'id')
      .then(function(artist_ids) {

        var artist_id = artist_ids[0];
        knex('artist_names')
          .update({
            artist_id: artist_id
          })
          .where({
            id: artist_name_id
          })
          .then(function() {
            return resolve(artist_id);
          })
          .catch(function(e) {
            console.error(e);
            return reject(e);
          });
      })
      .catch(function(e) {
        console.error(e);
        return reject(e);
      });
  });
};

var processSong = function(radio_id, artist_name, song_title, timestamp) {
  return new RSVP.Promise(function(resolve, reject) {

    // console.log('radio_id:', radio_id);
    // console.log('artist_name:', artist_name);
    // console.log('song_title:', song_title);
    // console.log('timestamp:', timestamp);

    // first search for total query of artist name like "Nick & Simon"

    // not found? get all artists from the name, split by
    //  - feat
    //  - featuring
    //  - &
    //  - ,
    // like in "Pitbull Feat. Ne-yo, Afrojack & Nayer"

    // return all artist ids

    // save song with those artists

    // first get the name of the artist (artist can have multiple names)
    getArtistName(artist_name).then(function(artistNameResponse) {

      // with the artist_name and maybe an artist_id (when it already has been saved)
      // lets find the artist_id based on the artist_name_id
      getArtist(artistNameResponse.id, artistNameResponse.artist_id).then(function(artist_id) {

        // with the artist_id we can search in song_names with this artist_id
        console.log('artist_id:', artist_id);
        getSongTitle(song_title).then(function(song_id) {

          // with the song_id we can insert an item in the timeline
          console.log('song_id:', song_id);
          createTimelineItem(radio_id, song_id, timestamp).then(function(timeline_item) {

            // timeline item is created, lets return it with resolve
            return resolve(timeline_item);
            console.log('timeline_item:', timeline_item);
            console.log('createTimelineItem() SUCCEEDED!!!');

          }, function() {
            console.error('createTimelineItem() failed')
          });
        }, function() {
          console.error('getSongTitle() failed')
        });
      }, function() {
        console.error('getArtist() failed')
      });
    }, function() {
      console.error('getArtistName() failed')
    });

  });
};
