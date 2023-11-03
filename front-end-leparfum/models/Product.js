const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombreProducto: String,
  marca: String,
  imagen: String,
  cantidad:Number,
  marca: String,
  precio:Number,
  disponibilidad:Boolean,
  tamaño:Number,
  descripcion:String,
  sexo:String, //Hombre - Mujer
  tipo:Array
});

module.exports = mongoose.model('Product', userSchema);