// commonjs
/*
const pedidosService = require('../services/pedidos.service');
*/
// ES Modules
import pedidosService from '../services/pedidos.service.js';
import Pedido from '../models/Pedido.js';
import Cliente from '../models/clientes.schema.js';
import Producto from '../models/Producto.js';

class PedidosController {
  
  obtenerTodos = async (req, res) => {
    try {
      const pedidos = await pedidosService.obtenerTodos();
      res.status(200).json({ error: false, data: pedidos });
    } catch (error) {
      res.status(500).json({ error: true, mensaje: error.message });
    }
  };

  crear = async (req, res) => {
    try {
      const nuevoPedido = await pedidosService.crear(req.body);
      res.status(201).json({ error: false, data: nuevoPedido, mensaje: "Pedido creado con éxito" });
    } catch (error) {
      res.status(400).json({ error: true, mensaje: error.message });
    }
  };

  actualizarEstado = async (req, res) => {
    try {
      const pedidoActualizado = await pedidosService.actualizarEstado(req.params.id, req.body.estado);
      res.status(200).json({ error: false, data: pedidoActualizado });
    } catch (error) {
      res.status(400).json({ error: true, mensaje: error.message });
    }
  };
  // Prepara los datos y muestra el formulario de creación
  renderizarFormulario = async (req, res) => {
    try {
      // Buscamos clientes activos y productos disponibles
      const clientes = await Cliente.find({ estado: 1 });
      const productos = await Producto.find({ activo: true });
      
      res.render('pedidos_form', { clientes, productos });
    } catch (error) {
      res.status(500).send("Error al cargar el formulario de pedidos");
    }
  };

  // Recibe los datos del navegador y crea el pedido
  crearDesdeWeb = async (req, res) => {
    try {
      const { clienteId, productosIds, cantidades } = req.body;
      
      // Armamos el array de items tal cual lo espera tu servicio
      const items = [];
      if (productosIds && productosIds.length > 0) {
        // En caso de que sea un solo producto, Express lo manda como string, no como array.
        // Lo convertimos a array para iterar siempre seguro.
        const ids = Array.isArray(productosIds) ? productosIds : [productosIds];
        const cants = Array.isArray(cantidades) ? cantidades : [cantidades];

        for (let i = 0; i < ids.length; i++) {
          if (ids[i] && cants[i]) {
            items.push({
              productoId: ids[i],
              cantidad: parseInt(cants[i])
            });
          }
        }
      }

      // Llamamos a tu servicio existente (que ya calcula precios totales)
      await pedidosService.crear({ clienteId, items });
      
      res.redirect('/pedidos/view');
    } catch (error) {
      res.status(400).send(`
        <h3>Error al crear el pedido</h3>
        <p>${error.message}</p>
        <a href="/pedidos/nuevo">Intentar de nuevo</a>
      `);
    }
  };

  
  // Lista todos los pedidos en la tabla
  listarParaWeb = async (req, res) => {
    try {
      const pedidos = await pedidosService.obtenerTodos();
      res.render('pedidos', { pedidos });
    } catch (error) {
      res.status(500).send("Error al cargar la página de pedidos");
    }
  };

  // Cambia el estado (Ej: Pendiente a En Producción)
  cambiarEstadoWeb = async (req, res) => {
    try {
      const { id } = req.params;
      const { nuevoEstado } = req.body;
      
      await pedidosService.actualizarEstado(id, nuevoEstado);
      res.redirect('/pedidos/view');
    } catch (error) {
      res.status(400).send(`
        <h3>Error de Producción</h3>
        <p>${error.message}</p>
        <a href="/pedidos/view">Volver a Pedidos</a>
      `);
    }
  };

  // Busca un pedido por ID y muestra el desglose completo
 // Busca un pedido por ID y muestra el desglose completo
  verDetalleWeb = async (req, res) => {
    try {
      // 1. Apuntamos a 'productos.productoId' tal como está en tu esquema
      const pedido = await Pedido.findById(req.params.id).populate('productos.productoId');
      
      if (!pedido) {
        return res.status(404).send("Pedido no encontrado en el sistema.");
      }

      // 2. Convertimos el documento de Mongoose a un objeto Javascript estándar
      const pedidoObj = pedido.toObject();

      // 3. Nos aseguramos de que los datos estén listos para la vista
      // Le damos prioridad a los datos guardados históricamente en el pedido,
      // y si por alguna razón no están, usamos los del populate.
      pedidoObj.productos = pedidoObj.productos.map(item => {
        return {
          nombre: item.nombre || (item.productoId ? item.productoId.nombre : 'Producto Eliminado'),
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario || (item.productoId ? item.productoId.precio : 0)
        };
      });

      // 4. Enviamos el pedido ya formateado a la plantilla de Pug
      res.render('pedido_detalle', { pedido: pedidoObj });
    } catch (error) {
      res.status(500).send("Error al cargar el detalle del pedido: " + error.message);
    }
  };
}

// ES Modules
export default new PedidosController();
// commonjs
// module.exports = new PedidosController();
// ES Modules

