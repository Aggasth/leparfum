const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  nombre: String
});

module.exports = mongoose.model('Brand', brandSchema);