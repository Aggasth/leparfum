const mongoose = require('mongoose');

const RecomendacionSchema = new mongoose.Schema({
    idUser: String,
    preferencia: String
});

module.exports = mongoose.model('Recomendacion', RecomendacionSchema);