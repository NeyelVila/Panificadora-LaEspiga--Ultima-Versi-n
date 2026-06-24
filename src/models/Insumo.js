import { Schema, model } from 'mongoose';

const insumoSchema = new Schema({
  nombre: { type: String, required: true },
  unidad: { type: String, required: true },
  stockActual: { type: Number, required: true, default: 0 },
  stockMinimo: { type: Number, required: true, default: 0 },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

export default model('Insumo', insumoSchema);