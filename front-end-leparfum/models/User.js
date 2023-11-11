const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  celular: String,
  name: String,
  direccion: String,
  
});

module.exports = mongoose.model('User', userSchema);