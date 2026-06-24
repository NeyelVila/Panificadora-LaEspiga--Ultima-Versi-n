import Cliente from '../models/clientes.schema.js'; // <-- Ajusta el nombre de tu archivo de modelo de cliente si es distinto
import Pedido from '../models/Pedido.js';

class FacturacionService {
  async generarReporteFranquicias() {
    // 1. Buscamos todas las franquicias activas directamente en MongoDB
    const franquicias = await Cliente.find({ tipo: 'franquicia', estado: 1 });

    // 2. Construimos el reporte usando Promise.all porque vamos a hacer consultas asíncronas dentro de un map
    const reporte = await Promise.all(franquicias.map(async (franquicia) => {
      
      // Buscamos los pedidos de esta franquicia que ya fueron entregados
      const pedidosCompletados = await Pedido.find({ 
        clienteId: franquicia._id, // En Mongo, los IDs automáticos se llaman _id
        estado: 'Entregado' 
      });

      // Sumamos el total de esos pedidos
      const totalAdeudado = pedidosCompletados.reduce((suma, pedido) => suma + pedido.total, 0);

      return {
        clienteId: franquicia._id,
        nombreFranquicia: franquicia.nombre,
        pedidosEntregados: pedidosCompletados.length,
        totalAdeudado: totalAdeudado
      };
    }));

    return reporte;
  }
}

export default new FacturacionService();