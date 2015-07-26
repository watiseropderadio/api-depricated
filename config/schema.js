'use strict';

module.exports = function(mongoose) {
  var Schema = mongoose.Schema;
  var ObjectId = Schema.Types.ObjectId;
  var Schemas = {};

  Schemas.User = new Schema({
    username: { type: String, required: true },
    password: { type: String },
    scope: { type: Array, required: true, default: [ 'user' ]},
    updatedAt: { type: Date, default: new Date() }
  });

  Schemas.Task = new Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false, required: true },
    user: { type: ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: new Date() }
  });

  return Schemas;

};
