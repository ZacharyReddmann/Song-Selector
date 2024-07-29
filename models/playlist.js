const mongoose = require('mongoose');

// Create a Mongoose schema
const playlistSchema = new mongoose.Schema({
    name: String,
    Verse: String,
    song1: String,
    song2: String,
    song3: String,
    song4: String,
    song5: String,
    Invitational: String
  }, { versionKey: false }); //timestamps is possible to use

// Create a Mongoose model
const Playlist = mongoose.model('playlists', playlistSchema);

module.exports = Playlist;