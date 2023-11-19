const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    idUser:String,
    date:String,
    cart:Array,
    total:Number,
    status:Boolean
});

module.exports = mongoose.model('Sale', saleSchema);