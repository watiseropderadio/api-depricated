/*jslint white: true, unparam: true */

"use strict";

var pg = require('pg');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var RSVP = require('rsvp');
var _ = require('lodash');
var decode = require('ent/decode');

app.set('database', (process.env.PG_CONNECTION_STRING || false));
app.set('debug', (process.env.DEBUG === 'true' || process.env.DEBUG === true) ? true : false);
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

var knex = require('knex')({
  client: 'pg',
  connection: app.get('database'),
  debug: app.get('debug'),
  timezone: 'UTC'
});

function sendJson(res, rootName, object) {
  var json = {};
  if (typeof object === 'object' && Object.keys(object).length) {
    json[rootName] = object;
  } else if (typeof object === 'boolean') {
    json[rootName] = object;
  } else if (typeof object === 'string') {
    json[rootName] = [object];
  } else {
    res.status(404);
    json[rootName] = [];
  }
  res.send(JSON.stringify(json));
}

Array.prototype.hasSameValues = function(array) {
  // if the other array is a falsy value, return
  if (!array) {
    return false;
  }

  // compare lengths - can save a lot of time
  if (this.length !== array.length) {
    return false;
  }

  var i, j;
  for (i = 0; i < this.length; i++) {
    for (j = 0; j < array.length; j++) {
      if (this.indexOf(array[j]) < 0 || array.indexOf(this[i]) < 0) {
        return false;
      }
    }
  }
  return true;
};

var getArtist = function(artist_name) {

  return new RSVP.Promise(function(resolve, reject) {

    artist_name = artist_name.trim();

    knex('artist_names')
      .select('id', 'artist_id')
      .where({
        name: artist_name
      })
      .limit(1)
      .then(function(rows) {
        if (rows.length === 1) {
          return resolve(rows[0].artist_id);
        }
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
                    return reject(e);
                  });
              })
              .catch(function(e) {
                return reject(e);
              });
          });
      })
      .catch(function(e) {
        return reject(e);
      });
  });

};

var getArtists = function(artistNames) {

  return new RSVP.Promise(function(resolve, reject) {

    // split artists in multiple artists if needed
    var artistNamesList = artistNames.split(/feat\.| feat |featuring | & |, /i);

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
        var i;

        for (i = 0; i < foundArtistsResult.length; i++) {
          songId = foundArtistsResult[i].song_id;
          foundArtistsIds.push(foundArtistsResult[i].artist_id);
        }

        if (_.unique(artistIds).hasSameValues(_.unique(foundArtistsIds))) {
          return resolve(songId);
        }

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
                    var insertObject = {};
                    for (i = 0; i < artistIds.length; i++) {
                      insertObject = {};
                      insertObject.artist_id = artistIds[i];
                      insertObject.song_id = song_id;
                      insertObject.artist_order = i;
                      insertArray.push(insertObject);
                    }

                    knex('artists_songs').insert(insertArray)
                      .then(function() {
                        return resolve(song_id);
                      })
                      .catch(function(e) {
                        return reject(e);
                      });

                  })
                  .catch(function(e) {
                    return reject(e);
                  });
              })
              .catch(function(e) {
                return reject(e);
              });
          });

      })
      .catch(function(e) {
        return reject(e);
      });

  });

};

var createTimelineItem = function(radioId, songId, timestamp) {

  return new RSVP.Promise(function(resolve, reject) {

    var validTimestamp = (new Date(timestamp)).getTime() > 0;

    var on_air;
    if (validTimestamp) {
      on_air = timestamp;
    } else {
      on_air = new Date();
    }

    knex('timeline_items')
      .insert({
        radio_id: radioId,
        song_id: songId,
        on_air: on_air
      }, 'id')
      .then(function(timelineItems) {
        return resolve(timelineItems[0].id);
      })
      .catch(function(e) {
        return reject(e);
      });

  });

};

var getTimelineItem = function(radioId, songId, timestamp) {

  return new RSVP.Promise(function(resolve, reject) {

    var validTimestamp = (new Date(timestamp)).getTime() > 0;

    if (validTimestamp) {
      knex('timeline_items')
        .select('id')
        .where({
          radio_id: radioId,
          song_id: songId,
          on_air: timestamp
        })
        .then(function(timelineItems) {
          if (timelineItems.length > 0) {
            return resolve(timelineItems[0].id);
          }
          return createTimelineItem(radioId, songId, timestamp).then(function(itemId) {
            return reject(itemId);
          }, function(errors) {
            return reject(errors);
          });
        });
    } else {

      // try to find the song in the last 60 minutes
      knex('timeline_items')
        .select('id')
        .where({
          radio_id: radioId,
          song_id: songId
        })
        .andWhereRaw("on_air > now()::date - interval '1h'")
        .limit(1)
        .then(function(timelineItems) {
          if (timelineItems.length > 0) {
            return resolve(timelineItems[0].id);
          }

          // try to find the song in the last 20 songs of the radio station
          knex('timeline_items')
            .select('id', 'song_id')
            .where({
              radio_id: radioId
            })
            .limit(20)
            .then(function(timelineItems) {

              var i;
              for (i = 0; i < timelineItems.length; i++) {
                if (timelineItems[i].song_id === songId) {
                  return resolve(timelineItems[i].id);
                }
              }

              // no results, create time
              return createTimelineItem(radioId, songId, timestamp).then(function(itemId) {
                return resolve(itemId);
              }, function(errors) {
                return reject(errors);
              });
            });
        });
    }

  });

};

var processSong = function(radioId, artistName, songTitle, timestamp) {

  return new RSVP.Promise(function(resolve, reject) {

    // decode multiple times so there will be no encoding
    artistName = decode(decode(decode(artistName)));
    songTitle = decode(decode(decode(songTitle)));

    if (app.get('debug')) {
      console.log('radioId:', radioId, '| artistName:', artistName, '| songTitle:', songTitle, '| timestamp:', timestamp);
    }

    getArtists(artistName).then(function(artistIds) {

        getSongId(artistIds, songTitle).then(function(songId) {

            // with the song_id we can insert an item in the timeline
            getTimelineItem(radioId, songId, timestamp).then(function(timelineItemId) {

                if (app.get('debug')) {
                  knex('timeline_items')
                    .select('*')
                    .where({
                      id: timelineItemId
                    })
                    .limit(1)
                    .then(function(timelineItems) {
                      return resolve(timelineItems[0]);
                    })
                    .catch(function(e) {
                      return reject(e);
                    });
                } else {

                  // timeline item is created, lets return it with resolve
                  return resolve({
                    id: timelineItemId
                  });
                }

              },
              function(errors) {
                return reject(errors);
              });
          },
          function(errors) {
            return reject(errors);
          });

      },
      function(errors) {
        return reject(errors);
      });

  });

};

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
      sendJson(res, 'errors', e);
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
    });
  }

  var timestamp = timeline_item.timestamp || null;

  processSong(timeline_item.radio_id, timeline_item.artist_name, timeline_item.song_title, timestamp).then(function(timeline_item) {

    return sendJson(res, 'timeline_item', timeline_item);

  }, function(errors) {
    if (!_.isArray(errors)) {
      errors = [errors];
    }
    return sendJson(res, 'errors', errors);

  });

});

app.listen(app.get('port'), function() {

  if (!app.get('database')) {
    console.error('PG_CONNECTION_STRING is not available');
  }

  console.log('Node app is running at localhost:' + app.get('port'));

});
