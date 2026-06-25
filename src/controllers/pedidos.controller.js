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
  
  obtenerTodos = async (req, res) => {
   try {
    const { estado, fecha } = req.query;
    let filtro = {};

    // Filtro por estado
    if (estado) filtro.estado = estado;

    // Filtro por fecha (buscando pedidos del día seleccionado)
    if (fecha) {
      const inicio = new Date(fecha);
      inicio.setHours(0,0,0,0);
      const fin = new Date(fecha);
      fin.setHours(23,59,59,999);
      filtro.fechaPedido = { $gte: inicio, $lte: fin };
    }

    const pedidos = await Pedido.find(filtro).sort({ fechaPedido: -1 });
    res.render('pedidos', { pedidos, estadoActual: estado, fechaActual: fecha });
  } catch (error) {
    res.status(500).send("Error al cargar pedidos");
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
      // Aquí capturamos el mensaje de "Stock insuficiente"
      res.status(400).send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h3 style="color: #dc3545;">⚠️ No se pudo crear el pedido</h3>
          <p>${error.message}</p>
          <br>
          <a href="/pedidos/nuevo" class="btn btn-primary">Volver a intentar</a>
        </div>
      `);
    }
  };

  
  // Lista todos los pedidos en la tabla
  listarParaWeb = async (req, res) => {
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
      res.status(400).send(`
        <h3>Error al listar pedidos</h3>
        <p>${error.message}</p>
        <a href="/pedidos/view">Intentar de nuevo</a>
      `);
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

  // Avanza el estado del pedido un paso hacia adelante de forma lineal
 avanzarEstadoPedido = async (req, res) => {
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
        // Usamos { $inc: { stockActual: -cant } } pero MongoDB 
        // mantendrá el stock donde esté. Si quieres mayor control, 
        // verifica antes de descontar.
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
    console.error("🔴 ERROR AL AVANZAR ESTADO:", error);
    res.status(500).json({ error: "Error al avanzar el estado del pedido" });
  }
};

// Cancela un pedido (solo si no ha sido entregado aún)
  cancelarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await Pedido.findById(id);

    if (!pedido) return res.status(404).send("Pedido no encontrado");
    if (pedido.estado === 'Entregado') {
      return res.status(400).send("No se puede cancelar un pedido ya entregado");
    }

    // ¡NUEVA LÓGICA: DETECTAR SI YA SE HABÍA PRODUCIDO!
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
    console.error("🔴 ERROR REAL AL CANCELAR:", error);
    res.status(500).json({ error: "Error al cancelar el pedido" });
  }
 };
  asignarHorarioYDespachar = async (req, res) => {
   try {
    const { id } = req.params;
    const { horario } = req.body; // Este dato vendrá de un formulario pequeño

    await Pedido.findByIdAndUpdate(id, {
      horarioDespacho: horario,
      estado: 'Despachado'
    });

    res.redirect('/pedidos/view');
  } catch (error) {
    res.status(500).send("Error al asignar horario");
  }
 };

}

// ES Modules
export default new PedidosController();
// commonjs
// module.exports = new PedidosController();
// ES Modules

