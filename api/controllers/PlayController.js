/**
 * PlayController
 *
 * @description :: Server-side logic for managing plays
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var decode = require('ent/decode')
var RSVP = require('rsvp')
var async = require('async')

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

  new: function(req, res) {
    var play = req.body.play

    async.waterfall([

        function waterfallValidate(callback) {

          // Validate the hell out of it
          var errors = []
          if (!play) errors.push('No play as root object specified')
          if (!play.radioSlug) errors.push('No radioSlug specified')
          if (!play.artist) errors.push('No artist specified')
          if (!play.title) errors.push('No title specified')
          if (errors.length) {
            return callback(errors)
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
          }.bind(this))
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
        function waterfallCheckIfPlayExists(radio, artists, title, callback) {

          // Kind of the same as with returnArtist
          returnSong(artists, title).then(function(song) {
            return callback(null, radio, song)
          }, function(error) {
            if (!error) return callback(['Error with returnSong'])
            callback([error])
          })
        },
        function waterfallReturnPlay(radio, song, callback) {

          var date = new Date()
          return Play.create({
            radio: radio,
            song: song,
            playedAt: date
          }).exec(function createPlay(error, play) {
            if (error) return callback(error)

            // Check last x minutes
            // Last x songs
            // When posted with date, check before 15 and after 15 minutes
            return callback(null, play)
          })
        }
      ],
      function waterfallDone(errors, play) {
        if (errors) {
          return res.badRequest({
            errors: errors
          })
        }
        res.ok(play)
      })
  }
}
