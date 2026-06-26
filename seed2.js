import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
// Asegúrate de que la ruta coincida con la ubicación de tu modelo
import Usuario from './src/models/Usuario.js'; 

const crearAdmin = async () => {
  try {
    // 1. Conectamos a la base de datos (Atlas o local)
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/la_espiga_de_oro');
    console.log('🟢 Conectado a MongoDB para seeding');

    // 2. Verificamos si ya existe para no duplicarlo
    const adminExiste = await Usuario.findOne({ email: 'admin@laespiga.com' });
    if (adminExiste) {
      console.log('⚠️ El usuario administrador ya existe. Cancelando operación.');
      process.exit(0);
    }

    // 3. Encriptamos la contraseña "admin123"
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // 4. Creamos el usuario
    const nuevoAdmin = new Usuario({
      nombre: 'Neyel Admin',
      email: 'admin@laespiga.com',
      password: hashedPassword,
      rol: 'admin'
    });

    await nuevoAdmin.save();
    console.log('✅ ¡Usuario administrador creado con éxito en MongoDB Atlas!');
    console.log('👉 Email: admin@laespiga.com');
    console.log('👉 Contraseña: admin123');

  } catch (error) {
    console.error('🔴 Error al crear el administrador:', error);
  } finally {
    // 5. Cerramos la conexión y apagamos el script
    mongoose.connection.close();
    process.exit(0);
  }
};

crearAdmin();