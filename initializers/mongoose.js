'use strict';

var mongoose = require('mongoose');

var Adapter = function() {
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/wieodr');
};

module.exports = Adapter();
