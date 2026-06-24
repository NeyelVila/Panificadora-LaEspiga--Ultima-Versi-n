import mongoose from 'mongoose';

export const conectarDB = async () => {
  try {
    // 27017 es el puerto por defecto de MongoDB (no hace falta ponerlo), y 'la_espiga_de_oro' es el nombre de la base de datos. 
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/la_espiga_de_oro');
    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Error conectando MongoDB:', error.message);
    process.exit(1);
  }
};

