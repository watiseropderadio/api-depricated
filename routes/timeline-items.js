'use strict';

var _ = require('lodash');
var RSVP = require('rsvp');
var decode = require('ent/decode');

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

var getArtist = function(knex, artist_name) {

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

var getArtists = function(knex, artistNames) {

  return new RSVP.Promise(function(resolve, reject) {

    // split artists in multiple artists if needed
    var artistNamesList = artistNames
      .split(/feat\.| feat | ft\. | ft | - | vs\. | vs |featuring\. |featuring | & |, /i);

    var promises = artistNamesList.map(function(artistName) {
      return getArtist(knex, artistName);
    });

    RSVP.all(promises).then(function(artistIds) {
      return resolve(artistIds);
    }).catch(function(errors) {
      return reject(errors);
    });

  });

};

var getSongId = function(knex, artistIds, songTitle) {

  return new RSVP.Promise(function(resolve, reject) {

    songTitle = songTitle.trim();

    knex('song_titles')
      .select(knex.raw('"song_titles"."song_id", ARRAY_TO_JSON(ARRAY_AGG("artists_songs"."artist_id")) AS "artist_ids"'))
      .innerJoin('songs', 'songs.id', 'song_titles.song_id')
      .innerJoin('artists_songs', 'artists_songs.song_id', 'songs.id')
      .whereIn('artist_id', artistIds)
      .andWhere({
        title: songTitle
      })
      .groupBy('song_titles.song_id')
      .havingRaw('COUNT("artists_songs"."artist_id") = ?', artistIds.length)
      .orderBy('song_titles.song_id', 'asc')
      .then(function(foundArtistsResult) {

        // TODO: we can check if all the artistIds are in the array of artist_ids
        // now we just return the first row

        if (foundArtistsResult.length > 0) {
          return resolve(foundArtistsResult[0].song_id);
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

var createTimelineItem = function(knex, radioId, songId, timestamp) {

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
        return resolve(timelineItems[0]);
      })
      .catch(function(e) {
        return reject(e);
      });

  });

};

var getTimelineItem = function(knex, radioId, songId, timestamp) {

  return new RSVP.Promise(function(resolve, reject) {

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
          .orderBy('created_at', 'desc')
          .limit(20)
          .then(function(timelineItems) {

            var i;
            for (i = 0; i < timelineItems.length; i++) {
              if (timelineItems[i].song_id === songId) {
                return resolve(timelineItems[i].id);
              }
            }

            // no results, create time
            return createTimelineItem(knex, radioId, songId, timestamp).then(function(itemId) {
              return resolve(itemId);
            }, function(errors) {
              return reject(errors);
            });
          });
      });
  });

};

function allCaps(word) {
  var containsUpper = /[A-Z]/.test(word);
  var containsLower = /[a-z]/.test(word);
  return containsUpper && !containsLower;
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

var processSong = function(knex, radioId, artistName, songTitle, timestamp) {

  return new RSVP.Promise(function(resolve, reject) {

    // decode multiple times so there will be no encoding
    artistName = decode(decode(decode(artistName)));
    songTitle = decode(decode(decode(songTitle)));

    // if there are only capitals, make it title case
    artistName = (allCaps(artistName)) ? toTitleCase(artistName) : artistName;
    songTitle = (allCaps(songTitle)) ? toTitleCase(songTitle) : songTitle;

    getArtists(knex, artistName).then(function(artistIds) {

        getSongId(knex, artistIds, songTitle).then(function(songId) {

            // with the song_id we can insert an item in the timeline
            getTimelineItem(knex, radioId, songId, timestamp).then(function(timelineItemId) {

                if (process.env.DEBUG === 'true') {
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

var getArtistsBySongId = function(knex, timelineItem) {

  return new RSVP.Promise(function(resolve, reject) {

    var songId = timelineItem.song_id;

    knex('artists_songs')
      .select('artist_names.id', 'artist_names.name', 'artist_order as order')
      .innerJoin('artists', 'artists.id', 'artists_songs.artist_id')
      .innerJoin('artist_names', 'artist_names.id', 'artists.default_name_id')
      .where({
        song_id: songId
      })
      .then(function(artists) {
        timelineItem.artists = artists;
        return resolve(timelineItem);
      })
      .catch(function(e) {
        return reject(e);
      });

  });

};

exports.list = function(req, res) {

  var knex = req.knex;
  var where = (req.query.radio_id) ? {
    radio_id: req.query.radio_id
  } : {};
  var limit = (req.query.limit <= process.env.LIMIT_MAX && req.query.limit > 0) ? req.query.limit : 20;

  knex('timeline_items')
    .select('timeline_items.id', 'timeline_items.radio_id', 'timeline_items.song_id', 'song_titles.title', 'on_air')
    .innerJoin('songs', 'songs.id', 'timeline_items.song_id')
    .innerJoin('song_titles', 'song_titles.song_id', 'songs.id')
    .where(where)
    .orderBy('on_air', 'desc')
    .limit(limit)
    .then(function(timelineItems) {

      if (timelineItems.length === 0) {
        return sendJson(res, 'timeline_items', []);
      }

      var promises = timelineItems.map(function(timelineItem) {
        return getArtistsBySongId(knex, timelineItem);
      });

      new RSVP.Promise(function(resolve, reject) {
        RSVP
          .all(promises)
          .then(function(timelineItems) {
            return resolve(timelineItems);
          })
          .catch(function(errors) {
            return reject(errors);
          });
      })
        .then(function(timelineItems) {
          return sendJson(res, 'timeline_items', timelineItems);
        }, function(errors) {
          return sendJson(res, 'errors', errors);
        });

    })
    .catch(function(e) {
      sendJson(res, 'errors', e);
    });
};

exports.add = function(req, res) {

  var knex = req.knex;

  // check for api key in .env
  if (_.isUndefined(process.env.API_KEY)) {
    return sendJson(res, 'errors', {
      required: 'API_KEY is not set in your .env'
    });
  }

  // check if the api key is valid
  if (req.body.api_key !== process.env.API_KEY || _.isUndefined(process.env.API_KEY)) {
    if (_.isUndefined(req.body.api_key)) {
      return sendJson(res, 'errors', {
        required: 'api_key is not found, it should be namespaced with timeline_item'
      });
    }
    return sendJson(res, 'errors', {
      invalid: 'api_key is found but it it not valid'
    });
  }

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

  processSong(knex, timeline_item.radio_id, timeline_item.artist_name, timeline_item.song_title, timestamp)
    .then(function(timeline_item) {

      return sendJson(res, 'timeline_item', timeline_item);

    }, function(errors) {
      if (!_.isArray(errors)) {
        errors = [errors];
      }
      return sendJson(res, 'errors', errors);

    });

};
