/**
 * Song.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {

    slug: {
      type: 'string',
      required: true,
      alphanumericdashed: true,
      lowercase: true
    },
    titles: {
      type: 'array',
      required: true
    },
    artists: {
      collection: 'artist',
      via: 'songs',
      required: true
    },
    plays: {
      collection: 'play',
      via: 'song'
    }
  }
};
