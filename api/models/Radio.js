/**
 * Radio.js
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
      type: 'string',
      required: true
    },
    nameShort: {
      type: 'string',
      required: true
    },
    countryCode: {
      type: 'string',
      required: true
    },
    streams: {
      type: 'array',
      url: true
    },
    website: {
      type: 'string',
      url: true
    },
    plays: {
      collection: 'play',
      via: 'radio'
    }
  }
};
