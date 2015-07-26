'use strict';

module.exports = function(DS) {
  return {

    _verb: 'tasks',
    _expose: ['index', 'show', 'new', 'update', 'delete'],

    index: {

      scope: [ '*' ],

      responder: function(req, res, next) {
        res.send({ tasks: [] });
        next();
      }

    },

    show: {

      scope: [ '*' ],

      responder: function(req, res, next) {
        res.send({ tasks: [] });
        next();
      }

    },

    new: {

      scope: [ '*' ],

      responder: function(req, res, next) {
        res.send({ tasks: [] });
        next();
      }

    },

    update: {

      scope: [ '*' ],

      responder: function(req, res, next) {
        res.send({ tasks: [] });
        next();
      }

    },

    delete: {

      scope: [ '*' ],

      responder: function(req, res, next) {
        res.send({ tasks: [] });
        next();
      }

    },

  };
};
