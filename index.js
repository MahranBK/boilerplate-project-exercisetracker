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



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
