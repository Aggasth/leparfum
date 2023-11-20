const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  celular: String,
  name: String,
  preferences: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Preferences'
  },
  direccion: String,
  suscrito:{
    active: Boolean,
    type: String
  }
});

module.exports = mongoose.model('User', userSchema);
