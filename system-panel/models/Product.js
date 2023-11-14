const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nombreProducto: String,
  marca: String,
  imagen: String,
  cantidad:Number,
  precio:Number,
  disponibilidad:Boolean,
  tamaño:Number,
  descripcion:String,
  sexo:String, //Hombre - Mujer
  tipo:Array
});

module.exports = mongoose.model('Product', productSchema);