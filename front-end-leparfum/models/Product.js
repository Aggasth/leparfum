const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombreProducto: String,
  imagen: String,
  cantidad:Number,
  precio:Number,
  disponibilidad:Boolean,
  tamaño:Number,
  descripcion:String,
  sexo:String,
  tags:Array
});

module.exports = mongoose.model('Product', userSchema);