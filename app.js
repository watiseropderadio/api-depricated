var pg = require('pg');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var RSVP = require('rsvp');
var _ = require('lodash');
var decode = require('ent/decode');

app.set('database', (process.env.PG_CONNECTION_STRING || false));
app.set('debug', (process.env.DEBUG || false));
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
  connection: app.get('database'),
  debug: app.get('debug')
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

Array.prototype.hasSameValues = function(array) {
  // if the other array is a falsy value, return
  if (!array)
    return false;

  // compare lengths - can save a lot of time
  if (this.length != array.length)
    return false;

  for (var i = 0; i < this.length; i++) {
    for (var j = 0; j < array.length; j++) {
      if (this.indexOf(array[j]) < 0 || array.indexOf(this[i]) < 0) {
        return false;
      }
    }
  }
  return true;
}

var getArtist = function(artist_name) {

  return new RSVP.Promise(function(resolve, reject) {

    artist_name = artist_name.trim();

    debug = app.get('debug');

    knex('artist_names')
      .select('id', 'artist_id')
      .where({
        name: artist_name
      })
      .limit(1)
      .then(function(rows) {
        if (rows.length === 1) {
          return resolve(rows[0].artist_id);
        } else {
          knex('artist_names')
            .insert({
              artist_id: 0,
              name: artist_name
            }, 'id')
            .then(function(artist_name_ids) {

              // create artist and update artist_names record
              var artist_name_id = artist_name_ids[0];
              knex('artists')
                .insert({
                  default_name_id: artist_name_id
                }, 'id')
                .then(function(artist_ids) {

                  var new_artist_id = artist_ids[0];
                  knex('artist_names')
                    .update({
                      artist_id: new_artist_id
                    })
                    .where({
                      id: artist_name_id
                    })
                    .then(function() {
                      return resolve(new_artist_id);
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
        }
      })
      .catch(function(e) {
        console.error(e);
        return reject(e);
      });
  });

};

var getArtists = function(artistNames) {

  return new RSVP.Promise(function(resolve, reject) {

    // split artists in multiple artists if needed
    artistNamesList = artistNames.split(/feat\.| feat |featuring | & |, /i);

    var promises = artistNamesList.map(function(artistName) {
      return getArtist(artistName);
    });

    RSVP.all(promises).then(function(artistIds) {
      return resolve(artistIds);
    }).catch(function(errors) {
      return reject(errors);
    });

  });

};

var getSongId = function(artistIds, songTitle) {

  return new RSVP.Promise(function(resolve, reject) {

    songTitle = songTitle.trim();

    knex('song_titles')
      .select('artists_songs.artist_id', 'artists_songs.song_id')
      .innerJoin('songs', 'songs.id', 'song_titles.song_id')
      .innerJoin('artists_songs', 'artists_songs.song_id', 'songs.id')
      .where({
        title: songTitle
      })
      .then(function(foundArtistsResult) {

        var foundArtistsIds = [];
        var songId;
        for (var i = 0; i < foundArtistsResult.length; i++) {
          songId = foundArtistsResult[i].song_id;
          foundArtistsIds.push(foundArtistsResult[i].artist_id);
        };

        if (_.unique(artistIds).hasSameValues(_.unique(foundArtistsIds))) {
          return resolve(songId);
        } else {

          // create song title, create song, link to artistIds
          knex('song_titles')
            .insert({
              song_id: 0,
              title: songTitle
            }, 'id')
            .then(function(song_title_ids) {

              // create song and update song_title record
              var song_title_id = song_title_ids[0];
              knex('songs')
                .insert({
                  default_title_id: song_title_id
                }, 'id')
                .then(function(song_ids) {

                  var song_id = song_ids[0];
                  knex('song_titles')
                    .update({
                      song_id: song_id
                    })
                    .where({
                      id: song_title_id
                    })
                    .then(function() {

                      // link artist to the song
                      var insertArray = [];
                      for (var i = 0; i < artistIds.length; i++) {
                        var insertObject = {};
                        insertObject.artist_id = artistIds[i];
                        insertObject.song_id = song_id;
                        insertObject.artist_order = i;
                        insertArray.push(insertObject);
                      };

                      knex('artists_songs').insert(insertArray)
                        .then(function() {
                          return resolve(song_id);
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
                })
                .catch(function(e) {
                  console.error(e);
                  return reject(e);
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

var processSong = function(radio_id, artist_name, song_title, timestamp) {

  return new RSVP.Promise(function(resolve, reject) {

    // decode multiple times so there will be no encoding
    artist_name = decode(decode(decode(artist_name)));
    song_title = decode(decode(decode(song_title)));

    console.log('radio_id:', radio_id, '| artist_name:', artist_name, '| song_title:', song_title, '| timestamp:', timestamp);

    getArtists(artist_name).then(function(artistIds) {
      console.log('==> artist_ids: ', artistIds)

      getSongId(artistIds, song_title).then(function(songId) {

        // with the song_id we can insert an item in the timeline
        console.log('songId:', songId);

        createTimelineItem(radio_id, song_id, timestamp).then(function(timeline_item) {

          // timeline item is created, lets return it with resolve
          return resolve(timeline_item);
          console.log('timeline_item:', timeline_item);
          console.log('createTimelineItem() SUCCEEDED!!!');

        }, function(errors) {
          console.error('createTimelineItem() failed')
          return reject(errors);
        });
      }, function(errors) {
        console.error('getSongTitle() failed')
        return reject(errors);
      });

    }, function(errors) {
      return reject(errors);
    });

  });

};
