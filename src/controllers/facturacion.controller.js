import facturacionService from '../services/facturacion.service.js';

class FacturacionController {
  // Le agregamos la palabra 'async' antes de los parámetros
  obtenerReporte = async (req, res) => {
    try {
      // Le agregamos la palabra 'await' para esperar la respuesta de la base de datos
      const reporte = await facturacionService.generarReporteFranquicias();
      res.status(200).json({ error: false, data: reporte });
    } catch (error) {
      res.status(500).json({ error: true, mensaje: error.message });
    }
  };
}

export default new FacturacionController();