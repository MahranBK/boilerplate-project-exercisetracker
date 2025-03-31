const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

mongoose.connect(process.env.Mongo_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

const exerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

const userSchema = new mongoose.Schema({
  username: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// create user
app.post('/api/users', async (req, res) => {
  try {
    const username = req.body.username;
    const newUser = await User.create({ username });
    res.json({ username: newUser.username, _id: newUser._id });
  } catch (err) {
    res.status(500).json({ error: "Error creating user" });
  }
});

// fetch all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username _id');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching all users' });
  }
});

// create exercise
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const user = await User.findById(req.params._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const date = req.body.date ? new Date(req.body.date) : new Date();

    const exercise = await Exercise.create({
      username: user.username,
      description: req.body.description,
      duration: parseInt(req.body.duration),
      date: date
    });

    res.json({
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
      _id: user._id
    });
  } catch (err) {
    res.status(500).json({ error: "Error creating exercise for user" });
  }
});

// fetch exercise log
app.get('/api/users/:_id/logs?[from][&to][&limit]', async (req, res) => {
  try {
    const user = await User.findById(req.params._id);
    const from = req.query.from;
    const to = req.query.to;
    const limit = req.query.limit;
    
    var query = {username: user.username};

    if (req.query.from || req.query.to) {
      query.date = {};
      if (req.query.from) query.date.$gte = new Date(req.query.from);
      if (req.query.to) query.date.$lte = new Date(req.query.to);
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const exercises = await Exercise.find(query)
    .select('description duration date')
    .limit(limit);

    res.json({
      username: user.username,
      _id: user._id,
      count: exercises.length,
      log: exercises.map(ex => ({
        description: ex.description,
        duration: ex.duration,
        date: ex.date.toDateString()
      }))
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching exercise log for user" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
