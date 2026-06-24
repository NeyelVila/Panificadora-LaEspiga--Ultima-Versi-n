import Pedido from '../models/Pedido.js';
import Insumo from '../models/Insumo.js';
import Receta from '../models/Receta.js';
import Cliente from '../models/clientes.schema.js'; // Ajusta al nombre de tu schema de clientes
import Producto from '../models/Producto.js';

class PedidosService {
  async obtenerTodos() {
    return await Pedido.find().sort({ fechaCreacion: -1 });
  }

  async crear(datos) {
    const { clienteId, items } = datos;

    // 1. Validar Cliente (Asegurarnos de que existe y su estado es 1)
    const cliente = await Cliente.findById(clienteId);
    if (!cliente || cliente.estado !== 1) {
      throw new Error("Cliente inválido o inactivo.");
    }

    // 2. Validar Productos y calcular el Total
    let total = 0;
    const productosValidados = [];

    for (const item of items) {
      const producto = await Producto.findById(item.productoId);
      
      if (!producto || !producto.activo) {
        throw new Error(`El producto ${item.productoId} no existe o está inactivo.`);
      }
      if (item.cantidad <= 0) {
        throw new Error(`La cantidad para ${producto.nombre} debe ser mayor a 0.`);
      }

      total += producto.precio * item.cantidad;
      
      // Armamos el item con los datos reales de la DB
      productosValidados.push({
        productoId: producto._id,
        nombre: producto.nombre,
        cantidad: item.cantidad,
        precioUnitario: producto.precio
      });
    }

    // 3. Crear el pedido
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

    // Buscamos el pedido en MongoDB
    const pedido = await Pedido.findById(id);
    if (!pedido) throw new Error("Pedido no encontrado.");

    // Solo descontamos stock si pasa a Producción por primera vez
    if (pedido.estado === 'Pendiente' && nuevoEstado === 'En Producción') {
      
      // 1. Calcular insumos totales requeridos para todo el pedido
      const insumosRequeridos = {}; 

      for (const item of pedido.productos) {
        // Buscamos la receta en MongoDB
        const receta = await Receta.findOne({ productoId: item.productoId });
        if (!receta) {
          throw new Error(`El producto ${item.nombre} no tiene una receta configurada. Imposible producir.`);
        }

        // Multiplicamos la cantidad del ingrediente por la cantidad de productos pedidos
        for (const ing of receta.ingredientes) {
          const insumoIdStr = ing.insumoId.toString(); // En Mongo los IDs son objetos, los pasamos a texto para usarlos de llave
          if (!insumosRequeridos[insumoIdStr]) insumosRequeridos[insumoIdStr] = 0;
          insumosRequeridos[insumoIdStr] += (ing.cantidad * item.cantidad);
        }
      }

      // 2. Verificar que haya stock suficiente de todo ANTES de descontar
      for (const insumoId in insumosRequeridos) {
        const insumoDb = await Insumo.findById(insumoId);
        if (!insumoDb) throw new Error(`Insumo no encontrado en la base de datos.`);

        const cantidadNecesaria = insumosRequeridos[insumoId];
        if (insumoDb.stockActual < cantidadNecesaria) {
          const faltante = cantidadNecesaria - insumoDb.stockActual;
          throw new Error(`Stock insuficiente de ${insumoDb.nombre}. Faltan ${faltante} ${insumoDb.unidad}.`);
        }
      }

      // 3. Descontar el stock (Si llegamos aquí, es porque alcanza todo)
      for (const insumoId in insumosRequeridos) {
        const insumoDb = await Insumo.findById(insumoId);
        insumoDb.stockActual -= insumosRequeridos[insumoId];
        await insumoDb.save(); // Guardamos el nuevo stock en MongoDB
      }
    }

    // Actualizamos el estado del pedido y guardamos
    const estadoAnterior = pedido.estado;
    pedido.estado = nuevoEstado;
    const pedidoActualizado = await pedido.save();
    const mensaje = `Pedido actualizado de ${estadoAnterior} a ${nuevoEstado}.`;
    return { pedido: pedidoActualizado, mensaje };
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
