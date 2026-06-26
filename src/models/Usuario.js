import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ['admin', 'empleado'],
    default: 'empleado'
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Usuario', usuarioSchema);