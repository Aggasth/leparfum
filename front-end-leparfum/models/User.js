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
  suscrito: {
    active: Boolean,
    type: String
  },
  idTipoPerfume: Number  // Añadir el campo idTipoPerfume al esquema de usuario
});

module.exports = mongoose.model('User', userSchema);
