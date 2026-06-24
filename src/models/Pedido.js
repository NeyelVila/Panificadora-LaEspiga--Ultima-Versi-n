import { Schema, model } from 'mongoose';

const pedidoSchema = new Schema({
  clienteId: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
  nombreCliente: String,
  productos: [{
    productoId: { type: Schema.Types.ObjectId, ref: 'Producto' },
    nombre: String,
    cantidad: Number,
    precioUnitario: Number
  }],
  total: { type: Number, required: true },
  estado: { 
    type: String, 
    enum: ['Pendiente', 'En Producción', 'Despachado', 'Entregado'], 
    default: 'Pendiente' 
  },
  fechaCreacion: { type: Date, default: Date.now }
}, { timestamps: true });

export default model('Pedido', pedidoSchema);