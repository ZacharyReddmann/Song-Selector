// Require necessary modules
const express = require('express');
const app = express();

const mongoose = require('mongoose');
const Song = require('./models/song');
const Playlist = require('./models/playlist');
const bodyParser = require('body-parser');
const path = require('path');

const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const PizZip = require('pizzip');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/joyMusic', {
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('Failed to connect to MongoDB', err));


// Middleware for parsing application/x-www-form-urlencoded
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/****************************EXPORT DOC START****************************/
app.post('/generate-document', (req, res) => {
  const { playlistName, verse, song1, song2, song3, song4, song5, invitational } = req.body;
  const filename = `${playlistName} Music Set.docx`;

  // Load the template file
  const templateContent = fs.readFileSync('Church Website Template.docx', 'binary');
  const zip = new PizZip(templateContent);
  const doc = new Docxtemplater(zip);

  // Data to fill in the template
  const data = {
      NAME: playlistName,
      VERSE: verse,
      SONG1: song1,
      SONG2: song2,
      SONG3: song3,
      SONG4: song4,
      SONG5: song5,
      INVITATIONAL: invitational
  };

  // Set the data for placeholders in the template
  doc.setData(data);

  try {
      // Render the document
      doc.render();

      // Generate the Word document
      const generatedDoc = doc.getZip().generate({ type: 'nodebuffer' });

      // Send the generated document as a response
      res.set('Content-Disposition', `attachment; filename="${filename}"`);
      res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.send(generatedDoc);

      console.log('Document created successfully.');
  } catch (error) {
      console.error('Error creating document:', error);
      // Handle errors here, e.g., send an error response to the client
      res.status(500).send('Error creating document');
  }
});
/**************************EXPORT DOC END******************************** */


var songList = [];
var songListWithID = [];
var playlistList = [];
var playlistListWithID = [];

/************************/
Song.find({}, {_id: 0}) 
.exec()
.then(function(documents)
{
  songList = documents;
  //console.log(documents);
})

Song.find({}) 
.exec()
.then(function(documents)
{
  songListWithID = documents;
  //console.log(documents);
})
/************************/
Playlist.find({}, {_id: 0}) 
.exec()
.then(function(documents)
{
  playlistList = documents;
  //console.log(documents);
})

Playlist.find({}) 
.exec()
.then(function(documents)
{
  playlistListWithID = documents;
  //console.log(documents);
})
/************************/
app.get('/get-songs', async (req, res) => {
  res.json(songList);
});

app.get('/get-songs-with-id', async (req, res) => {
  res.json(songListWithID);
});
/************************/
app.get('/get-playlists', async (req, res) => {
  res.json(playlistList);
});

app.get('/get-playlists-with-id', async (req, res) => {
  res.json(playlistListWithID);
});
/************************/

// Handle adding song submission
app.post('/add-song', async (req, res) => {
  try {
    // Create a new song object based on user input
    const newSong = new Song({
      name: req.body.name,
      type: req.body.type,
      startKey: req.body.startKey,
      endKey: req.body.endKey,
      date: req.body.date
    });

    // Save the song to the database
    await newSong.save();

    //res.send('Song added successfully!');
    res.redirect('/addSong.html');
  } catch (error) {
    console.error('Failed to add song', error);
    res.status(500).send('Failed to add song');
  }
});

/************************************************/

// Handle adding playlist submission
app.post('/add-playlist', async (req, res) => {
  try {
    // Create a new song object based on user input
    const newPlaylist = new Playlist({
      name: req.body.name,
      Verse: req.body.Verse,
      song1: req.body.song1,
      song2: req.body.song2,
      song3: req.body.song3,
      song4: req.body.song4,
      song5: req.body.song5,
      Invitational: req.body.Invitational
    });

    // Save the song to the database
    await newPlaylist.save();

    //res.send('Song added successfully!');
    res.redirect('/index.html');
  } catch (error) {
    console.error('Failed to add playlist', error);
    res.status(500).send('Failed to add playlist');
  }
});

/************************************************/

// Define a route to handle PUT requests to update a song
app.put('/update-song/:id', async (req, res) => {
  try {
      const songId = req.params.id;
      const updatedSongData = req.body;

      // Update the song document in the database
      const updatedSong = await Song.findByIdAndUpdate(songId, updatedSongData, { new: true });

      // Check if the song was successfully updated
      if (updatedSong) {
          res.redirect('/addSong.html');
      } else {
        res.status(404).send('Song not found');
      }
  } catch (error) {
      console.error('Error updating song:', error);
      res.status(500).send('Failed to update song');
  }
});

/************************************************/

// Define a route to handle PUT requests to update a song
app.put('/update-playlist/:id', async (req, res) => {
  try {
      const playlistId = req.params.id;
      const updatedPlaylistData = req.body;

      // Update the song document in the database
      const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, updatedPlaylistData, { new: true });

      // Check if the song was successfully updated
      if (updatedPlaylist) {
          res.redirect('/playlist.html');
      } else {
        res.status(404).send('Playlist not found');
      }
  } catch (error) {
      console.error('Error updating playlist:', error);
      res.status(500).send('Failed to update playlist');
  }
});

/************************************************/
//Main update route...
// Define a route to handle PUT requests to update a song
app.put('/update-song-dates', async (req, res) => {
  try 
  {
    // Extract updated song data from request body
      const updatedSongs = req.body;

     // Iterate over each updated song
     for (const updatedSong of updatedSongs) 
     {
      const { id, date } = updatedSong;
      // Update the song document in the database
      await Song.findByIdAndUpdate(id, { date }, { new: true });
    }

    // Send a success response
    res.status(200).json({ message: 'Song dates updated successfully' });
  } catch (error) 
  {
      console.error('Error updating song dates:', error);
      // Send an error response
      res.status(500).json({ error: 'Failed to update song dates' });
  }
});


/************************************************/
//Define a route to handle GET requests to the /update-song-dates?
app.get('/update-song-dates', (req, res) => {
  // Redirect GET requests to the addSong.html page or any other page as needed
  res.redirect('/index.html');
});

/************************************************/

// Define a route to handle GET requests to the /update-song endpoint
app.get('/update-song', (req, res) => {
  // Redirect GET requests to the addSong.html page or any other page as needed
  res.redirect('/addSong.html');
});

/************************************************/

// Define a route to handle GET requests to the /update-playlist endpoint
app.get('/update-playlist', (req, res) => {
  // Redirect GET requests to the addSong.html page or any other page as needed
  res.redirect('/playlist.html');
});

/************************************************/

// Define a route to handle DELETE requests to delete a song
app.delete('/delete-song/:id', async (req, res) => {
  try {
      const songId = req.params.id;

      // Delete the song document from the database
      const deletedSong = await Song.findByIdAndDelete(songId);

      // Check if the song was successfully deleted
      if (deletedSong) {
        res.status(200).send('Song deleted successfully');
          //res.redirect('/addSong.html');
      } else {
          res.status(404).send('Song not found');
      }
  } catch (error) {
      console.error('Error deleting song:', error);
      res.status(500).send('Failed to delete song');
  }
});

/************************************************/

// Define a route to handle DELETE requests to delete a song
app.delete('/delete-playlist/:id', async (req, res) => {
  try {
      const playlistId = req.params.id;

      // Delete the song document from the database
      const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

      // Check if the song was successfully deleted
      if (deletedPlaylist) {
        res.status(200).send('Playlist deleted successfully');
          //res.redirect('/addSong.html');
      } else {
          res.status(404).send('Playlist not found');
      }
  } catch (error) {
      console.error('Error deleting playlist:', error);
      res.status(500).send('Failed to delete playlist');
  }
});

/***********************************************/

// Define static folder for serving HTML, CSS, and JavaScript files (THIS makes my CSS files not work )
app.use(express.static(path.join(__dirname, 'public')));


//my IP address is 10.11.12.12 so the person has to enter 10.11.12.12:3000
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

