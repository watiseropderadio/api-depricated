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
    return this.validate(req, res);
  },

  validate: function(req, res) {
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
    return this.findRadio(req, res);
  },

  findRadio: function(req, res) {
    var play = req.body.play;

    // Find radio based on slug
    Radio.findOne({
      slug: play.radioSlug
    }).exec(function findOneCB(err, radio) {
      if (!radio) return res.badRequest('Radio with slug "' + play.radioSlug + '" is not found');
      return this.findArtist(req, res, radio);
    }.bind(this));
  },

  findArtist: function(req, res, radio) {
    var play = {
      radio: radio.id
    };

    Play.create(play).exec(function(err, sample) {
      if (err) return res.serverError(err);
      res.json(sample);
    });
  }

};
