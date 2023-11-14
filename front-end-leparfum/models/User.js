const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  celular: String,
  name: String,
  preferences: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Preferences'
  }
});

module.exports = mongoose.model('User', userSchema);
