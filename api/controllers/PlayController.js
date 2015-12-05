/**
 * PlayController
 *
 * @description :: Server-side logic for managing plays
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var decode = require('ent/decode')
var RSVP = require('rsvp')
var async = require('async')
var moment = require('moment-timezone')

var find = require('./../utils/find')
var returnArtist = require('./../utils/return-artist')
var returnSong = require('./../utils/return-song')

/**
 * String functions
 */

function allCaps(word) {
  var containsUpper = /[A-Z]/.test(word)
  var containsLower = /[a-z]/.test(word)
  return containsUpper && !containsLower
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

/**
 * Exported functions
 */

module.exports = {

  create: function(req, res) {
    var play = req.body.play
    var startDatetime = null

    async.waterfall([

        function waterfallValidate(callback) {

          // Validate the hell out of it
          var errors = []
          if (!play) errors.push('Specify \'play\' as root object')
          if (!play.radioSlug) errors.push('Specify a \'radioSlug\' (string)')
          if (!play.artist) errors.push('Specify an \'artist\' (string)')
          if (!play.title) errors.push('Specify a \'title\' (string)')
          if (!play.date && play.time) errors.push('Specify a \'date\' (ISO 8601) instead of \'time\'')
          if (!play.date && play.datetime) errors.push('Specify a \'date\' (ISO 8601) instead of \'datetime\'')
          if (!play.date && !play.timezone) errors.push('Specify a \'timezone\' (like \'Europe/Amsterdam\') when not posting a \'date\'')
          if (play.date && !moment(play.date, moment.ISO_8601).isValid()) errors.push('Specify a valid \'date\' (ISO 8601)')
          if (play.date && _.isUndefined(play.exact)) errors.push('Specify \'exact\' (boolean) when posting \'date\'')
          if (errors.length) {
            return callback(errors)
          }

          if (play.exact) {
            if (play.exact === 'true') {
              play.exact = true
            } else if (play.exact === 'false') {
              play.exact = false
            }
          }

          if (play.timezone) {
            startDatetime = moment().tz(play.timezone)
          }

          // Pass data through
          callback(null)
        },
        function waterfallFindRadio(callback) {

          // Find the radio based on slug
          Radio.findOne({
            slug: play.radioSlug
          }).exec(function findOneCB(error, radio) {
            if (error) return callback('Error with radio find function for slug ' + play.radioSlug)
            if (!radio) return callback('No radio found with slug ' + play.radioSlug)
            callback(null, radio)
          })
        },
        function waterfallDecodePlay(radio, callback) {

          // Decode multiple times so there will be no encoding
          artist = decode(decode(decode(play.artist)))
          title = decode(decode(decode(play.title)))

          // If there are only capitals, make it title case
          artist = (allCaps(artist)) ? toTitleCase(artist) : artist
          title = (allCaps(title)) ? toTitleCase(title) : title

          // Pass data through
          callback(null, radio, artist, title)
        },
        function waterfallFindOrSplitArtist(radio, artist, title, callback) {

          // Check if the whole string as artist (like "Nick & Simon")
          return ArtistName.find({
            name: artist
          }).exec(function findOneCB(error, artists) {
            if (error) return callback(error)
            if (artists.length > 0) return callback(null, radio, artists[0], null, title)

            // Split artist name so it will return an array of artists
            var artistNames = artist.split(/feat\.| feat | ft\. | ft | - | vs\. | vs |featuring\. |featuring | & |, /i)
            return callback(null, radio, null, artistNames, title)
          })
        },
        function waterfallReturnArtists(radio, oneArtist, artistNames, title, callback) {

          // Skip this function when there is already one artist found
          if (oneArtist) return callback(null, radio, [oneArtist], title)

          // Loop over all artists
          var promises = artistNames.map(function(artistName) {
            return returnArtist(artistName)
          })

          // Make async calls and return artists
          RSVP.all(promises).then(function(artists) {

            // If there are artist, get the corresponding waterline model
            if (artists.length > 0) {
              var ids = []
              artists.map(function(artist) {
                var id = artist.id || artist._id
                ids.push(id)
              })
              return Artist.find({
                id: ids
              }).exec(function findOneCB(error, artists) {
                return callback(null, radio, artists, title)
              })
            }
            callback(['returnArtist does not give artists back'])
          }).catch(function(errors) {
            return callback(errors)
          })
        },
        function waterfallReturnSong(radio, artists, title, callback) {

          // Kind of the same as with returnArtist
          returnSong(artists, title).then(function(song) {
            return callback(null, radio, song)
          }, function(error) {
            if (!error) return callback(['Error with returnSong'])
            callback([error])
          })
        },
        function waterfallPlayExactExists(radio, song, callback) {
          // If there is an exact date, go test if is exists
          if (!play.date || (play.date && play.exact !== true)) return callback(null, radio, song)

          var date = moment(play.date).format()
          var findOptions = {
            radio: radio.id,
            song: song.id,
            playedAt: new Date(date)
          }
          Play.findOne(findOptions).exec(function findExistingSong(error, result) {
            if (error) return callback(error)
            if (result) return callback('This song with this exact time is already added')
            callback(null, radio, song)
          })
        },
        function waterfallFindCloseInTime(radio, song, callback) {
          if (!play.date) return callback(null, radio, song)

          var begin = moment(play.date).subtract(15, 'minutes').format()
          var end = moment(play.date).add(15, 'minutes').format()

          var queryObj = {
            radio: radio.id,
            song: song.id,
            playedAt: {
              '>=': new Date(begin),
              '<': new Date(end)
            }
          }
          Play.findOne(queryObj).exec(function(error, play) {
            if (error) return callback(error)
            if (play) return callback('This song is already added in 30 minutes around that time')
            callback(null, radio, song)
          });
        },
        function waterfallPlayInLastItems(radio, song, callback) {
          Play.find({
            radio: radio.id
          }).limit(20).exec(function findExistingSongInLastItems(error, result) {
            if (error) return callback(error)
            if (!result) return callback(null, radio, song)
            var songFound = false
            for (var i = result.length - 1; i >= 0; i--) {
              var songId = result[i].song
              if (songId === song.id) {
                songFound = true
              }
            }
            if (songFound) return callback('This song is already added in the last 20 items of ' + radio.name)
            callback(null, radio, song)
          })
        },
        function waterfallReturnPlay(radio, song, callback) {

          if (play.date) {
            date = play.date
          } else {
            date = startDatetime.format()
          }

          return Play.create({
            radio: radio,
            song: song,
            exact: play.exact,
            playedAt: date
          }).exec(function createPlay(error, play) {
            if (error) return callback(error)
            callback(null, play)
          })
        }
      ],
      function waterfallDone(errors, play) {
        if (errors) {
          if (typeof errors !== 'object') {
            errors = [errors]
          }
          return res.badRequest(errors)
        }
        res.ok(play)
      })
  }
}
