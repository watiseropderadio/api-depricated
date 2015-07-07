/**
 * PlayController
 *
 * @description :: Server-side logic for managing plays
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var decode = require('ent/decode');
var RSVP = require('rsvp');
var find = require('./../utils/find');

/**
 * String functions
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

/**
 * Preformat and validate functions
 */

function validate(req, res) {
  var errors = [];
  var play = req.body.play;
  if (!play) errors.push('No play as root object specified');
  if (!play.radioSlug) errors.push('No radioSlug specified');
  if (!play.artist) errors.push('No artist specified');
  if (!play.title) errors.push('No title specified');
  if (errors.length) {
    return res.badRequest({
      errors: errors
    });
  }
  return decode(req, res);
};

function decode(req, res) {
  var reqPlay = req.body.play;

  // decode multiple times so there will be no encoding
  artist = decode(decode(decode(reqPlay.artist)));
  title = decode(decode(decode(reqPlay.title)));

  // if there are only capitals, make it title case
  artist = (allCaps(artist)) ? toTitleCase(artist) : artist;
  title = (allCaps(title)) ? toTitleCase(title) : title;

  return findRadio(req, res, {
    artist: artist,
    title: title
  });
};

/**
 * Find functions
 */

function findRadio(req, res, play) {
  var reqPlay = req.body.play;
  find.radio(play.radioSlug).then(function(radio) {
    console.log(radio);
  });

};

function splitArtists(req, res, play) {
  find.findOrCreateArtists(play.artist).then(function(artistIds) {
    play.artists
  });
};

function findArtists(req, res, play) {
  var promises = play.artists.map(function(artist) {
    return findArtist(artist);
  });

  RSVP.all(promises).then(function(artistIds) {
    return resolve(artistIds);
  }).catch(function(errors) {
    return reject(errors);
  });
};

function findArtist(artist) {
  var reqPlay = req.body.play;

  Artist.findOne({
    slug: reqPlay.artist
  }).exec(function findOneCB(err, artist) {
    if (!artist) {
      // create artist
      return this.createArtist(req, res, reqPlay.artist);
    }

    return res.ok({

    });
  }.bind(this));
};

/**
 * Create functions
 */

function createPlay(req, res, radio) {
  var play = {
    radio: radio.id
  };

  Play.create(play).exec(function(err, sample) {
    if (err) return res.serverError(err);
    res.json(sample);
  });
};

/**
 * Exported functions
 */

module.exports = {

  new: function(req, res) {
    return validate(req, res);
  }

};
