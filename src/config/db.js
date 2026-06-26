import mongoose from 'mongoose';

// Variable global para guardar el estado de la conexión en Vercel
let isConnected = false; 

export const conectarDB = async () => {
  // Si ya estamos conectados, no hacemos nada y usamos esa conexión
  if (isConnected) {
    console.log('⚡ Usando conexión a MongoDB existente (Caché)');
    return;
  }

  try {
    // Si no hay conexión, la creamos
    const db = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/la_espiga_de_oro', {
      serverSelectionTimeoutMS: 5000, // Le damos 5 segundos máximo para encontrar el servidor
    });
    
    // Guardamos el estado para futuras peticiones
    isConnected = db.connections[0].readyState === 1;
    console.log('🟢 MongoDB conectado exitosamente');
  } catch (error) {
    console.error('🔴 Error conectando MongoDB:', error.message);
  }
};