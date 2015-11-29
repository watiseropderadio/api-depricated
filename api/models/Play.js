/**
 * Play.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {

    playedAt: {
      type: 'datetime'
    },
    exact: {
      type: 'boolean'
    },
    radio: {
      model: 'radio',
      // required: true // Does not work due https://github.com/balderdashy/sails/issues/2073
    },
    song: {
      model: 'song'
    },
    recording: {
      model: 'recording'
    }
  }

};
