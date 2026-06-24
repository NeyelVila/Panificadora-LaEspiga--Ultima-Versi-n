import { Schema, model } from 'mongoose';

const productoSchema = new Schema({
  nombre: { type: String, required: true },
  categoria: { type: String, required: true },
  precio: { type: Number, required: true },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

export default model('Producto', productoSchema);