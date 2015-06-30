var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ItemSchema = new Schema({
  name: {
    type: String,
    index: true
  },
  equipped: Boolean,
  owner_id: {
    type: ObjectId,
    index: true
  },
  room_id: {
    type: ObjectId,
    index: true
  }
});

module.exports = mongoose.model('Item', ItemSchema);
