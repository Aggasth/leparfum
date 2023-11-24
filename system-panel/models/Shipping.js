const mongoose = require('mongoose');

const detalleEnvioSchema = new mongoose.Schema({
  idUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ultimaEntrega: {
    type: Date
  },
  producto: {
    type: String
  },
  suscripcion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subs'
  },
  comentarios: String
});

module.exports = mongoose.model('DetalleEnvio', detalleEnvioSchema);
