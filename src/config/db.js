import mongoose from 'mongoose';

export const conectarDB = async () => {
  try {
    // Intentamos conectar a Mongo Atlas (nube) vía variable de entorno. 
    // Si no existe, usamos la base local 'la_espiga_de_oro' como respaldo.
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/la_espiga_de_oro');
    console.log('🟢 MongoDB conectado');
  } catch (error) {
    console.error('🔴 Error conectando MongoDB:', error.message);
    process.exit(1);
  }
};