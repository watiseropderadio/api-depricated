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

        function validate(callback) {
          // validate the hell out of it
          var errors = []
          if (!play) errors.push('No play as root object specified')
          if (!play.radioSlug) errors.push('No radioSlug specified')
          if (!play.artist) errors.push('No artist specified')
          if (!play.title) errors.push('No title specified')
          if (errors.length) {
            return callback(errors)
          }

          // pass data through
          callback(null)
        },
        function findRadio(callback) {
          // find the radio based on slug
          Radio.findOne({
            slug: play.radioSlug
          }).exec(function findOneCB(error, radio) {
            if (error) return callback('Error with radio find function for slug ' + play.radioSlug)
            if (!radio) return callback('No radio found with slug ' + play.radioSlug)
            callback(null, radio)
          }.bind(this))
        },
        function decodePlay(radio, callback) {
          // decode multiple times so there will be no encoding
          artist = decode(decode(decode(play.artist)))
          title = decode(decode(decode(play.title)))

          // if there are only capitals, make it title case
          artist = (allCaps(artist)) ? toTitleCase(artist) : artist
          title = (allCaps(title)) ? toTitleCase(title) : title

          // pass data through
          callback(null, radio, artist, title)
        },
        function findOrSplitArtist(radio, artist, title, callback) {

          // check if the whole string as artist (like "Nick & Simon")
          return Artist.native(function(error, collection) {
            if (error) return console.log(error)
            return collection.find({
              names: {
                '$in': [artist]
              }
            }).toArray(function(error, artistResult) {
              if (error) return console.log(error)
              if (artistResult.length > 0) {
                return callback(null, radio, artistResult[0], null, title)
              }

              // split artist name so it will return an array of artists
              var artists = artist.split(/feat\.| feat | ft\. | ft | - | vs\. | vs |featuring\. |featuring | & |, /i)
              callback(null, radio, null, artists, title)
            })
          })
        },
        function returnArtists(radio, oneArtist, artists, title, callback) {
          // loop over all artists
          if (oneArtist) return callback(null, radio, [oneArtist], title)
          var promises = artists.map(function(artist) {
              return returnArtist(artist)
            })
            // make async calls and return artists
          RSVP.all(promises).then(function(artists) {
            return callback(null, radio, artists, title)
          }).catch(function(errors) {
            return callback(errors)
          })
        },
        function returnSong(radio, artists, title, callback) {
          // kind of the same as with returnArtist
          return callback(null, radio, artists, title)
        },
        function returnPlay(radio, artists, title, callback) {
          // check last x minutes
          // last x songs
          // when posted with date, check before 15 and after 15 minutes
          return callback(null, radio, artists, title)
        }
      ],
      function done(errors, radio, artists, title) {
        if (errors) {
          return res.badRequest({
            errors: errors
          })
        }
        res.ok({
          radio: radio,
          artists: artists,
          title: title
        })
      })
  }
}
