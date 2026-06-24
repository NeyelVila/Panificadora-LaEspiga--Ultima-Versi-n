// CODIGO UTILIZADO PARA POBLAR LA BASE DE DATOS CON DATOS INICIALES PARA PRUEBAS.
//  EJECUTAR ESTE ARCHIVO CON NODE PARA SEMBRAR LOS DATOS EN MONGODB.
// UTILIZA LOS DATOS JSON QUE SE CREAN EN ESTE ARCHIVO PARA REALIZAR PRUEBAS EN POSTMAN O EN EL FRONTEND, 
// ASÍ NO TIENES QUE CREAR TODO DESDE CERO CADA VEZ QUE REINICIAS LA BASE DE DATOS.
import mongoose from 'mongoose';
import { conectarDB } from './src/config/db.js';
import Insumo from './src/models/Insumo.js';
import Producto from './src/models/Producto.js';
import Receta from './src/models/Receta.js';
import Cliente from './src/models/clientes.schema.js';

const poblarBaseDeDatos = async () => {
  try {
    // 1. Conectamos a MongoDB
    await conectarDB();

    console.log('🧹 Limpiando la base de datos (borrando datos viejos)...');
    await Insumo.deleteMany();
    await Producto.deleteMany();
    await Receta.deleteMany();
    await Cliente.deleteMany();

    console.log('🌾 Sembrando Insumos...');
    const harina = await Insumo.create({ nombre: 'Harina 0000', unidad: 'kg', stockActual: 500, stockMinimo: 50 });
    const levadura = await Insumo.create({ nombre: 'Levadura Fresca', unidad: 'gr', stockActual: 2000, stockMinimo: 500 });
    const sal = await Insumo.create({ nombre: 'Sal Fina', unidad: 'gr', stockActual: 5000, stockMinimo: 1000 });

    console.log('🥖 Sembrando Productos...');
    const panFrances = await Producto.create({ nombre: 'Pan Francés', categoria: 'Panificados', precio: 1200 });
    const medialunas = await Producto.create({ nombre: 'Medialunas de Manteca', categoria: 'Facturas', precio: 3500 });

    console.log('📝 Sembrando Recetas...');
    await Receta.create({
      productoId: panFrances._id,
      ingredientes: [
        { insumoId: harina._id, cantidad: 1 },    // 1 kg de harina
        { insumoId: levadura._id, cantidad: 50 }, // 50 gr de levadura
        { insumoId: sal._id, cantidad: 20 }       // 20 gr de sal
      ]
    });

    console.log('👥 Sembrando Clientes...');
    await Cliente.create({ nombre: 'Sucursal Central', tipo: 'sucursal', telefono: '123456789', direccion: 'Calle 123', email: 'sucursal@laespiga.com', estado: 1 });
    await Cliente.create({ nombre: 'Domingo (Franquicia)', tipo: 'franquicia', telefono: '987654321', direccion: 'Avenida 456', email: 'domingo@laespiga.com', estado: 1 });

    console.log('✅ ¡Base de datos poblada con éxito! La Espiga de Oro está lista para operar.');
    process.exit(0); // Cerramos el script correctamente
  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error.message);
    process.exit(1); // Cerramos con código de error
  }
};

// Ejecutamos la función
poblarBaseDeDatos();