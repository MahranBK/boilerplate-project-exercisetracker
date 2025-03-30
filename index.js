const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
require('dotenv').config()

app.use(bodyParser.urlencoded())
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

mongoose.connect(process.env.Mongo_URI,
{useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Connection Error:", err));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});;

const exerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: String,
  _id: {type: String, required: true}
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

const userSchema = new mongoose.Schema({
  username: {type: String, required: true}
});

const User = mongoose.model('User', userSchema);

const logSchema = new mongoose.Schema({
  username: String,
  count: Number,
  _id: {type: String, required: true},
  log: [{
    description: String,
    duration: Number,
    date: String,
  }]
});

const Log = mongoose.model('Log', logSchema);

//create user
app.post('/api/users', async (req, res) => {
  try {
    const username = req.body.username;

    const newUser = await User.create({ username });
    res.json({ username: newUser.username, _id: newUser._id });

  } catch (err) {
    res.status(500).json({ error: "Error creating user" });
  }
});

//fetch all users
app.get('/api/users', async(req, res) => {
  try{
    const users = await User.find({}, 'username _id');
    res.json(users);

  }catch(error){
    res.status(500).json({ error: 'Error fetching all users' });
  }
});

//create exercise
app.post('/api/users/:_id/exercises', async(req, res) => {
  try{
    const user =  await User.findById(req.params._id);
    const exercise = await Exercise.create({
      username: user.username,
      description: req.body.description,
      duration: parseInt(req.body.duration),
      date: req.body.date ? new Date(req.body.date) : new Date(),
      _id: user._id
    });
    res.json({
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
      _id: user._id
    });

  }catch(errr){
    res.status(500).json({ error: 'Error creating ex for user'}); 
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
