import mongoose from 'mongoose';

const facturacionSchema = new mongoose.Schema({
  pedidoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Pedido', 
    required: true 
  },
  clienteId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cliente' 
    // No es 'required' por si es una venta a consumidor final sin registrar
  },
  montoTotal: { 
    type: Number, 
    required: true 
  },
  metodoPago: { 
    type: String, 
    enum: ['Efectivo', 'Mercado Pago', 'Tarjeta Débito', 'Tarjeta Crédito'], 
    default: 'Efectivo' 
  },
  fechaCobro: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('Facturacion', facturacionSchema);