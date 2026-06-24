// ES Modules
import Cliente from '../models/clientes.schema.js';

// MÉTODOS
const getClientesActivos = async () => {
  return await Cliente.find({ estado: 1 });
};

const getClientesActivosPorId = async (id) => {
  return await Cliente.findOne({ 
    _id: id, 
    estado: 1 
  });
};

const crearCliente = async(datos) => {
  return await Cliente.create({
    ...datos,
    estado: 1
  });
};

const actualizarCliente = async (id, datos) => {
  const clienteActualizado = 
  await Cliente.findByIdAndUpdate(
    id,
    datos,
    { new: true }
  );

  if (!clienteActualizado ) {
    throw new Error('Cliente no encontrado');
  }

  return  clienteActualizado ;
};

// REGLA DE BAJA (Soft Delete)
const eliminarCliente = async (id) => {
  const cliente = await Cliente.findById(id);

  /* implementar cuando se implemente el módulo de pedidos y se pueda validar que el cliente no tenga pedidos activos 
  const pedidos = leerPedidos();
  const clienteIndex = clientes.findIndex(c => c.id === Number(id)); 
  */
  if (!cliente) {
    throw new Error('Cliente no encontrado');
  }

  // 1. Validar que no tenga pedidos activos
  /* implementar cuando se implemente el módulo de pedidos y se pueda validar que el cliente no tenga pedidos activos
  const tienePedidosActivos = pedidos.some(pedido => 
    pedido.clienteId === Number(id) && 
    ['Pendiente', 'En Producción'].includes(pedido.estado)
  );
  if (tienePedidosActivos) {
    throw new Error('No se puede dar de baja: El cliente tiene pedidos en curso.');
  }
 */
  // 2. Baja lógica
  cliente.estado = 0; // Marcar como inactivo
  await cliente.save(); // Guardar cambios en la base de datos
  return cliente; 
}

// ES Modules - no poner default si se exportan varias cosas
export { 
  getClientesActivos, 
  getClientesActivosPorId,
  crearCliente, 
  eliminarCliente, 
  actualizarCliente 
};
