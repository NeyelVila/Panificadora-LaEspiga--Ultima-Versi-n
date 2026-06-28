import Pedido from '../models/Pedido.js';
import Facturacion from '../models/Facturacion.js';
import Producto from '../models/Producto.js';
import FacturacionService from '../services/facturacion.service.js';
class FacturacionController {
  
  listarPendientesCobro = async (req, res, next) => {
    try {
      const pedidosPendientes = await Pedido.find({ 
        pagado: false, 
        estado: { $ne: 'Cancelado' } 
      })
      .populate('clienteId', 'nombre')
      .sort({ fechaCreacion: 1 });
      
      const todasLasFacturas = await Facturacion.find();
      const totalFacturado = todasLasFacturas.reduce((acumulador, factura) => {
        return acumulador + factura.montoTotal;
      }, 0);

      res.render('facturacion', { 
        pedidos: pedidosPendientes,
        totalFacturado: totalFacturado 
      });
    } catch (error) {
      next(error); // Pasamos el error al middleware global de manejo de errores
    }
  };

  cobrarEfectivo = async (req, res, next) => {
    try {
      const { id } = req.params;
      const pedido = await Pedido.findById(id);
      
      if (!pedido) return res.status(404).send("Pedido no encontrado");

      // 1. ACTUALIZAR STOCK ENTREGADO
      for (const item of pedido.productos) {
        // Aseguramos que tomamos el ID correctamente
        const pId = item.productoId._id || item.productoId;
        await Producto.findByIdAndUpdate(pId, {
          $inc: { totalEntregado: item.cantidad }
        });
      }

      // 2. CREAR COMPROBANTE
      await Facturacion.create({
        pedidoId: pedido._id,
        clienteId: pedido.clienteId || null, 
        montoTotal: pedido.total,
        metodoPago: 'Efectivo'
      });

      // 3. MARCAR PEDIDO COMO PAGADO Y ENTREGADO
      await Pedido.findByIdAndUpdate(id, { 
        pagado: true,
        estado: 'Entregado' 
      });

      res.redirect('/facturacion/view');
    } catch (error) {
      next(error); // Pasamos el error al middleware global de manejo de errores
    }
  };
  
  verReporteFranquicias = async (req, res, next) => {
    try {
      // 1. Llamamos al servicio para generar el reporte de franquicias
      const reporte = await FacturacionService.generarReporteFranquicias();
      
      // 2. Respondemos. Por ahora podriamos devolver un JSON para probar que funciona.
      // Más adelante podriamos cambiar esto por un res.render('reporte_franquicias', { reporte });
      res.status(200).json({ error: false, data: reporte });
    } catch (error) {
      next(error); 
    }
  };
}

export default new FacturacionController();