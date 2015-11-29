/**
 * Artist.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    slug: {
      type: 'string',
      unique: true,
      required: true,
      alphanumericdashed: true,
      lowercase: true
    },
    name: {
      type: 'string'
    },
    names: {
      collection: 'artistname',
      via: 'artist'
    },
    songs: {
      collection: 'song',
      via: 'artists'
    }
  }
};
