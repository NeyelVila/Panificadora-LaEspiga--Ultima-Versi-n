import Pedido from '../models/Pedido.js';
import Insumo from '../models/Insumo.js';
import Receta from '../models/Receta.js';
import Cliente from '../models/clientes.schema.js';
import Producto from '../models/Producto.js';

class PedidosService {
  async obtenerTodos() {
    return await Pedido.find().sort({ fechaCreacion: -1 });
  }

  async crear(datos) {
    const { clienteId, items } = datos;

    // 1. Validar Cliente
    const cliente = await Cliente.findById(clienteId);
    if (!cliente || cliente.estado !== 1) {
      throw new Error("Cliente inválido o inactivo.");
    }

    // 2. Pre-validación de Stock y cálculo de Total
    // Esto evita que entren pedidos que no podemos producir
    const insumosNecesarios = {};

    for (const item of items) {
      const producto = await Producto.findById(item.productoId);
      if (!producto || !producto.activo) {
        throw new Error(`El producto ${item.productoId} no existe o está inactivo.`);
      }

      // Buscamos la receta para saber qué insumos consume
      const receta = await Receta.findOne({ productoId: producto._id });
      if (receta) {
        for (const ing of receta.ingredientes) {
          const idStr = ing.insumoId.toString();
          insumosNecesarios[idStr] = (insumosNecesarios[idStr] || 0) + (ing.cantidad * item.cantidad);
        }
      }
    }

    // 3. Verificamos contra la base de datos antes de crear nada
    for (const insumoId in insumosNecesarios) {
      const insumo = await Insumo.findById(insumoId);
      if (!insumo || insumo.stockActual < insumosNecesarios[insumoId]) {
        throw new Error(`Stock insuficiente para producir este pedido (${insumo ? insumo.nombre : 'Insumo'}).`);
      }
    }

    // 4. Si todo es correcto, creamos el pedido
    let total = 0;
    const productosValidados = [];
    for (const item of items) {
      const prod = await Producto.findById(item.productoId);
      total += prod.precio * item.cantidad;
      productosValidados.push({
        productoId: prod._id,
        nombre: prod.nombre,
        cantidad: item.cantidad,
        precioUnitario: prod.precio
      });
    }

    const nuevoPedido = new Pedido({
      clienteId: cliente._id,
      nombreCliente: cliente.nombre,
      productos: productosValidados,
      total,
      estado: "Pendiente"
    });

    return await nuevoPedido.save();
  }
 //AUTOMATIZACIÓN DE STOCK

  // AUTOMATIZACIÓN DE STOCK CON MONGODB
 async actualizarEstado(id, nuevoEstado) {
    const estadosPermitidos = ['Pendiente', 'En Producción', 'Despachado', 'Entregado'];
    if (!estadosPermitidos.includes(nuevoEstado)) {
      throw new Error("Estado inválido.");
    }

    const pedido = await Pedido.findById(id);
    if (!pedido) throw new Error("Pedido no encontrado.");

    console.log(`DEBUG: Intentando pasar de ${pedido.estado} a ${nuevoEstado}`);

    // VERIFICACIÓN: ¿Entra aquí?
    if (pedido.estado === 'Pendiente' && nuevoEstado === 'En Producción') {
      console.log("DEBUG: Entrando a la lógica de descuento de insumos...");
      
      const insumosRequeridos = {}; 

      for (const item of pedido.productos) {
        const receta = await Receta.findOne({ productoId: item.productoId });
        
        if (!receta) {
          console.error(`DEBUG: El producto ${item.nombre} NO tiene receta.`);
          throw new Error(`El producto ${item.nombre} no tiene receta.`);
        }

        for (const ing of receta.ingredientes) {
          const insumoIdStr = ing.insumoId.toString();
          if (!insumosRequeridos[insumoIdStr]) insumosRequeridos[insumoIdStr] = 0;
          insumosRequeridos[insumoIdStr] += (ing.cantidad * item.cantidad);
        }
      }

      console.log("DEBUG: Insumos calculados:", insumosRequeridos);

      // Descontar
      for (const insumoId in insumosRequeridos) {
        const insumoDb = await Insumo.findById(insumoId);
        if (insumoDb) {
          console.log(`DEBUG: Descontando ${insumosRequeridos[insumoId]} de ${insumoDb.nombre}`);
          insumoDb.stockActual -= insumosRequeridos[insumoId];
          await insumoDb.save();
        }
      }
    } else {
      console.log("DEBUG: No se cumplió la condición para descontar insumos (¿ya estaba en Producción?).");
    }

    pedido.estado = nuevoEstado;
    return await pedido.save();
  }
}

export default new PedidosService();

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

// // Rutas a nuestras "tablas" en la base de datos
// const pedidosPath = path.join(__dirname, '../data/pedidos.json');
// const clientesPath = path.join(__dirname, '../data/clientes.json');
// const productosPath = path.join(__dirname, '../data/productos.json');
// const recetasPath = path.join(__dirname, '../data/recetas.json');  
// const insumosPath = path.join(__dirname, '../data/insumos.json');

// const leerJson = (ruta) => {
//   if (!fs.existsSync(ruta)) fs.writeFileSync(ruta, '[]', 'utf-8');
//   return JSON.parse(fs.readFileSync(ruta, 'utf-8'));
// };

// const guardarJson = (ruta, datos) => {
//   fs.writeFileSync(ruta, JSON.stringify(datos, null, 2));
// };

// class PedidosService {
//   obtenerTodos() {
//     return leerJson(pedidosPath);
//   }

//   crear(datos) {
//     const { clienteId, items } = datos;
//     const clientes = leerJson(clientesPath);
//     const productosDb = leerJson(productosPath);
//     const pedidos = leerJson(pedidosPath);

//     // Validar Cliente (Ajustado para usar estado: 1)
//     const cliente = clientes.find(c => c.id === clienteId && c.estado === 1);
//     if (!cliente) throw new Error("Cliente inválido o inactivo.");

//     let total = 0;
//     const productosValidados = items.map(item => {
//       const producto = productosDb.find(p => p.id === item.productoId && p.activo);
//       if (!producto) throw new Error(`El producto ${item.productoId} no existe o está inactivo.`);
//       if (item.cantidad <= 0) throw new Error(`La cantidad para ${producto.nombre} debe ser mayor a 0.`);
      
//       total += producto.precio * item.cantidad;
//       return {
//         productoId: producto.id,
//         nombre: producto.nombre,
//         cantidad: item.cantidad,
//         precioUnitario: producto.precio
//       };
//     });

//     const nuevoPedido = {
//       id: `ped_${crypto.randomBytes(4).toString('hex')}`,
//       clienteId,
//       nombreCliente: cliente.nombre,
//       productos: productosValidados,
//       total,
//       estado: "Pendiente",
//       fechaCreacion: new Date().toISOString()
//     };

//     pedidos.push(nuevoPedido);
//     guardarJson(pedidosPath, pedidos);
    
//     return nuevoPedido;
//   }

 

// commonjs
// module.exports = new PedidosService();
// ES Modules
// export default new PedidosService();
