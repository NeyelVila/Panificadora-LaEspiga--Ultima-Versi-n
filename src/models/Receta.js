import { Schema, model } from 'mongoose';

const recetaSchema = new Schema({
  productoId: { type: Schema.Types.ObjectId, ref: 'Producto', required: true, unique: true },
  ingredientes: [{
    insumoId: { type: Schema.Types.ObjectId, ref: 'Insumo', required: true },
    cantidad: { type: Number, required: true }
  }]
}, { timestamps: true });

export default model('Receta', recetaSchema);