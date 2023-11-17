const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    idUser: String,
    cart: Array,
    total: Number,
    date: Date
});

module.exports = mongoose.model('Sale', saleSchema);