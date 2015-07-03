/**
 * PlayController
 *
 * @description :: Server-side logic for managing plays
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

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

module.exports = {

  new: function(req, res) {

    if (req.wantsJSON) {
      console.log('json');
    } else {
      console.log('nooo json');
    }

    console.log(req.body);
    return res.json({
      play: {
        id: '34oi34oij'
      }
    });
  },

  processPlay: function(req, res) {

    if (req.wantsJSON) {
      console.log('json');
    } else {
      console.log('nooo json');
    }

    console.log(req.body);
    return res.json({
      play: {
        id: '34oi34oij'
      }
    });
  },

  process: function(radioId, artistName, songTitle, timestamp) {

  },

  getArtist: function(artistName) {

  },

  getArtists: function(artistNames) {

  },

  getSong: function(artistIds, songTitle) {

  },

  createPlay: function(radioId, songId, timestamp) {

  },

  getPlay: function(radioId, songId, timestamp) {

  },

};
