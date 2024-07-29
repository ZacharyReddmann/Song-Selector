const mongoose = require('mongoose');

// Create a Mongoose schema
const songSchema = new mongoose.Schema({
    name: String,
    type: String,
    startKey: String,
    endKey: String,
    date: String
  }, { versionKey: false }); //timestamps is possible to use

// Create a Mongoose model
const Song = mongoose.model('songs', songSchema);

module.exports = Song;