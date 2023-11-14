const mongoose = require('mongoose');

const preferencesSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sexo: String,
  actividad: String,
  estacion: String,
  evento: String,
  color: String
});

module.exports = mongoose.model('Preferences', preferencesSchema);
