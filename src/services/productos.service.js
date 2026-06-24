import Producto from '../models/Producto.js';
import Pedido from '../models/Pedido.js';

class ProductosService {
  async obtenerTodos() {
    return await Producto.find({ activo: true });
  }

  async crear(datos) {
    const nuevoProducto = new Producto(datos);
    return await nuevoProducto.save();
  }

  async darDeBaja(id) {
    // 1. Regla de negocio: ¿Está en un pedido en curso?
    const pedidoActivo = await Pedido.findOne({
      "productos.productoId": id,
      estado: { $in: ['Pendiente', 'En Producción'] }
    });

    if (pedidoActivo) {
      throw new Error("No se puede dar de baja: El producto está en un pedido en curso.");
    }

    // 2. Si pasa la validación, hacemos el soft delete
    return await Producto.findByIdAndUpdate(id, { activo: false }, { new: true });
  }
}

export default new ProductosService();

// ##########CODIGO ANTERIOR CON ARCHIVOS JSON (SIN BASE DE DATOS)##########
// // commonjs
// /*
// const fs = require('fs');
// const path = require('path');
// const crypto = require('crypto');
// */
// // ES Modules
// import fs from 'fs';
// import path from 'path';
// import crypto from 'crypto';

// // Para obtener __dirname en ES Modules, se necesita esta configuración adicional
// import { fileURLToPath } from 'url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Rutas absolutas
// const productosPath = path.join(__dirname, '../data/productos.json');
// const pedidosPath = path.join(__dirname, '../data/pedidos.json');

// // Funciones auxiliares para leer y guardar
// const leerProductos = () => JSON.parse(fs.readFileSync(productosPath, 'utf-8'));
// const guardarProductos = (datos) => fs.writeFileSync(productosPath, JSON.stringify(datos, null, 2));
// const leerPedidos = () => JSON.parse(fs.readFileSync(pedidosPath, 'utf-8'));

// class ProductosService {
//   obtenerTodos() {
//     const productos = leerProductos();
//     return productos.filter(p => p.activo);
//   }

//   crear(datos) {
//     const productos = leerProductos();
//     const nuevoProducto = {
//       id: `prod_${crypto.randomBytes(4).toString('hex')}`,
//       ...datos,
//       activo: true
//     };
    
//     productos.push(nuevoProducto);
//     guardarProductos(productos);
//     return nuevoProducto;
//   }

//   // REGLA DE BAJA (Soft Delete)
//   darDeBaja(id) {
//     const productos = leerProductos();
//     const pedidos = leerPedidos();
    
//     const index = productos.findIndex(p => p.id === id);
//     if (index === -1) throw new Error("Producto no encontrado");

//     // Validar dependencias en pedidos activos
//     const enUso = pedidos.some(pedido => 
//       ['Pendiente', 'En Producción'].includes(pedido.estado) && 
//       pedido.productos.some(item => item.productoId === id)
//     );

//     if (enUso) {
//       throw new Error("No se puede dar de baja: El producto está en pedidos activos.");
//     }

//     productos[index].activo = false;
//     guardarProductos(productos);
    
//     return productos[index];
//   }
// }

// //commonjs
// // module.exports = new ProductosService();
// // ES Modules
// export default new ProductosService();  