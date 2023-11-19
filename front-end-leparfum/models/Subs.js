const mongoose = require('mongoose');

const subsSchema = new mongoose.Schema({
    idUser: String,
    Type: String,
    date: Date
});

module.exports = mongoose.model('Subs', subsSchema);