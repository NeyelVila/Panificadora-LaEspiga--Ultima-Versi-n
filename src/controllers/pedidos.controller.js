// commonjs
/*
const pedidosService = require('../services/pedidos.service');
*/
// ES Modules
import pedidosService from '../services/pedidos.service.js';
import Pedido from '../models/Pedido.js';
import Cliente from '../models/clientes.schema.js';
import Producto from '../models/Producto.js';
import Receta from '../models/Receta.js';
import Insumo from '../models/Insumo.js';

class PedidosController {
  
  obtenerTodos = async (req, res, next) => {
   try {
    const pedidos = await pedidosService.obtenerTodos();
    res.status(200).json({ error: false, data: pedidos });
  } catch (error) {
    next(error); // Pasamos el error al middleware global de manejo de errores
  }
  };

  crear = async (req, res, next) => {
    try {
      const nuevoPedido = await pedidosService.crear(req.body);
      res.status(201).json({ error: false, data: nuevoPedido, mensaje: "Pedido creado con éxito" });
    } catch (error) {
      next(error); // Pasamos el error al middleware global de manejo de errores
    }
  };

  actualizarEstado = async (req, res, next) => {
    try {
      const pedidoActualizado = await pedidosService.actualizarEstado(req.params.id, req.body.estado);
      res.status(200).json({ error: false, data: pedidoActualizado });
    } catch (error) {
      next(error); // Pasamos el error al middleware global de manejo de errores
    }
  };
  // Prepara los datos y muestra el formulario de creación
  renderizarFormulario = async (req, res, next) => {
    try {
      // Buscamos clientes activos y productos disponibles
      const clientes = await Cliente.find({ estado: 1 });
      const productos = await Producto.find({ activo: true });
      
      res.render('pedidos_form', { clientes, productos });
    } catch (error) {
      next(error); // Pasamos el error al middleware global de manejo de errores
    }
  };

  // Recibe los datos del navegador y crea el pedido
  crearDesdeWeb = async (req, res, next) => {
    try {
      const { clienteId, productosIds, cantidades } = req.body;
      
      // Armamos el array de items tal cual lo espera tu servicio
      const items = [];
      if (productosIds && productosIds.length > 0) {
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

      await pedidosService.crear({ clienteId, items });
      
      res.redirect('/pedidos/view');
    } catch (error) {
      next(error); // Pasamos el error al middleware global de manejo de errores
    }
  };

  
  // Lista todos los pedidos en la tabla
  listarParaWeb = async (req, res, next) => {
    try {
      const { estado, fecha } = req.query;
      let filtro = {};
      if (estado) filtro.estado = estado;
      if (fecha) {
        const f = new Date(fecha);
        filtro.fechaCreacion = { 
          $gte: new Date(f.setHours(0,0,0)), 
          $lte: new Date(f.setHours(23,59,59)) 
        };
      }
      const pedidos = await Pedido.find(filtro).sort({ fechaCreacion: -1 });
      res.render('pedidos', { pedidos, estadoActual: estado, fechaActual: fecha });
    } catch (error) {
      next(error); // Pasamos el error al middleware global de manejo de errores
    }
  };

  // Cambia el estado (Ej: Pendiente a En Producción)
  cambiarEstadoWeb = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { nuevoEstado } = req.body;
      
      await pedidosService.actualizarEstado(id, nuevoEstado);
      res.redirect('/pedidos/view');
    } catch (error) {
      next(error); // Pasamos el error al middleware global de manejo de errores
    }
  };


  verDetalleWeb = async (req, res, next) => {
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
      next(error); // Pasamos el error al middleware global de manejo de errores
    }
  };

 avanzarEstadoPedido = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pedido = await Pedido.findById(id);

    if (!pedido) return res.status(404).send("Pedido no encontrado");

    if (pedido.estado === 'Pendiente') {
  for (const item of pedido.productos) {
    const receta = await Receta.findOne({ productoId: item.productoId });
    if (receta) {
      for (const ing of receta.ingredientes) {
        const cant = ing.cantidad * item.cantidad;
        await Insumo.findByIdAndUpdate(ing.insumoId, { $inc: { stockActual: -cant } });
      }
    }
  }
  pedido.estado = 'En Producción';

    } else if (pedido.estado === 'En Producion' || pedido.estado === 'En Producción') {
      pedido.estado = 'Despachado';

    } else if (pedido.estado === 'Despachado') {

  for (const item of pedido.productos) {
    await Producto.findByIdAndUpdate(item.productoId, {
      $inc: { totalEntregado: item.cantidad } // Esto incrementa el contador en MongoDB
    });
  }
     pedido.estado = 'Entregado';
}
    
    await pedido.save();
    res.redirect('/pedidos/view');
  } catch (error) {
    next(error); // Pasamos el error al middleware global de manejo de errores
  }
};

// Cancela un pedido (solo si no ha sido entregado aún)
  cancelarPedido = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pedido = await Pedido.findById(id);

    if (!pedido) return res.status(404).send("Pedido no encontrado");
    if (pedido.estado === 'Entregado') {
      return res.status(400).send("No se puede cancelar un pedido ya entregado");
    }

    // Si se cancela estando 'En Producción' o 'Despachado', el producto físico ya existe.
    // Lo sumamos al stock excedente de la panadería.
    if (pedido.estado === 'En Producción' || pedido.estado === 'Despachado') {
      for (const item of pedido.productos) {
        await Producto.findByIdAndUpdate(item.productoId, {
          $inc: { stockExcedente: item.cantidad }
        });
      }
    }

    pedido.estado = 'Cancelado';
    await pedido.save();

    res.redirect('/pedidos/view');
  } catch (error) {
    next(error); // Pasamos el error al middleware global de manejo de errores
  }
 };
  asignarHorarioYDespachar = async (req, res, next) => {
   try {
    const { id } = req.params;
    const { horario } = req.body; // Este dato vendrá de un formulario pequeño

    await Pedido.findByIdAndUpdate(id, {
      horarioDespacho: horario,
      estado: 'Despachado'
    });

    res.redirect('/pedidos/view');
  } catch (error) {
    next(error); // Pasamos el error al middleware global de manejo de errores
  }
 };

}

// ES Modules
export default new PedidosController();
// commonjs
// module.exports = new PedidosController();
// ES Modules

