import mongoose from 'mongoose';

const clienteSchema = new mongoose.Schema(
  {
    // no hace falta definir un campo _id, MongoDB lo genera automáticamente
    nombre: {
        type: String,
        required: true,
        minlength: [2, 'El nombre debe tener al menos 2 caracteres']
    },
    email: {
        type: String,
        required: true,
    },
     tipo: {
    type: String,
    required: true
    },

    direccion: {
      type: String,
      required: true
    },

    telefono: {
      type: String,
      required: true,
    },

    estado: {
      type: Number,
      default: 1
    }

  }, {
    // agrega automáticamente campos createdAt y updatedAt
  timestamps: true
});

// crea el modelo Cliente a partir del esquema clienteSchema y se pluraliza el nombre del modelo para crear el nombre de la colección en MongoDB (en este caso, "clientes")
export default mongoose.model('Cliente', clienteSchema);



   