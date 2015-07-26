'use strict';

module.exports = function(DS) {
  return {

    _verb: 'users',
    _expose: ['index', 'show', 'new', 'update', 'delete'],

    index: {

      scope: [ '*' ],

      responder: function(req, res, next) {
        res.send({ users: req.resource });
        next();
      }

    },

    show: {

      scope: [ '*' ],

      responder: function(req, res, next) {
        res.send({ users: req.resource });
        next();
      }

    },

    new: {

      scope: [ '*' ],

      responder: function(req, res, next) {
        var User = new DS.User(req.body);

        User.save(function(err) {
          res.send(User);
        });
      }

    },

    update: {

      scope: [ '*' ],

      responder: function(req, res, next) {
        res.send({ users: [] });
        next();
      }

    },

    delete: {

      scope: [ '*' ],

      responder: function(req, res, next) {
        res.send({ users: [] });
        next();
      }

    },

  };
};
