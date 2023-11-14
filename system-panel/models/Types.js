const mongoose = require('mongoose');

const typesSchema = new mongoose.Schema({
  tipo: String
});

module.exports = mongoose.model('Types', typesSchema);