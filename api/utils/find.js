/**
 * Find utils
 *
 * @description :: some utils for finding data or creating it
 */

var decode = require('ent/decode');
var RSVP = require('rsvp');

module.exports = {

  radio: function(slug) {
    return new RSVP.Promise(function(resolve, reject) {
      Radio.findOne({
        slug: slug
      }).exec(function findOneCB(err, radio) {
        if (err) return reject('Radio with slug "' + slug + '" is not found');
        return resolve(radio);
      }.bind(this));
    });
  },

  artists: function(artists) {

    return new RSVP.Promise(function(resolve, reject) {

      // split artists in multiple artists if needed
      var list = artists.split(/feat\.| feat | ft\. | ft | - | vs\. | vs |featuring\. |featuring | & |, /i);

      var promises = list.map(function(artist) {
        return findArtist(artist);
      });

      RSVP.all(promises).then(function(artistIds) {
        return resolve(artistIds);
      }).catch(function(errors) {
        return reject(errors);
      });

    });

  },

  artist: function(artist_name) {

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

  },

  song: function(artistIds, songTitle) {

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

  }

};
