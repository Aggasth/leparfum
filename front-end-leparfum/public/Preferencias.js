// preferencias.js
const mongoose = require('mongoose');

// Define el esquema para las preferencias
const preferenciasSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', 
    required: true
  },
  sexo: {
    type: String,
    required: true
  },
  actividad: {
    type: String,
    required: true
  },
  estacion: {
    type: String,
    required: true
  },
  eventos: {
    type: String,
    required: true
  },
  colores: {
    type: String,
    required: true
  }
});

// Crea el modelo de preferencias
const Preferencias = mongoose.model('Preferencias', preferenciasSchema);

// Agrega la función getActivityLabel
function getActivityLabel(actividad) {
  switch (actividad) {
    case '1':
      return 'Salir a cenar y socializar';
    case '2':
      return 'Salir ocasionalmente a tomar algo';
    case '3':
      return 'Juntas con amigos';
    default:
      return 'Actividad no especificada';
  }
}

function getSeasonLabel(estacion) {
  switch (estacion) {
      case '1':
          return 'Otoño';
      case '2':
          return 'Verano';
      case '3':
          return 'Primavera';
      case '4':
          return 'Invierno';
      default:
          return '';
  }
}

function getEventLabel(evento) {
  switch (evento) {
      case '1':
          return 'Reuniones informales con amigos';
      case '2':
          return 'Reuniones de negocios';
      case '3':
          return 'Citas a ciegas';
      case '4':
          return 'Reuniones en ambientes cerrados';
      default:
          return '';
  }
}

function getColorLabel(color) {
  switch (color) {
      case '1':
          return 'Grises';
      case '2':
          return 'Pasteles';
      case '3':
          return 'Cálidos';
      case '4':
          return 'Fríos';
      case '5':
          return 'Neón';
      default:
          return '';
  }
}

module.exports = { Preferencias, getActivityLabel, getSeasonLabel, getEventLabel, getColorLabel };
