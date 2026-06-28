// ES Modules
import Cliente from '../models/clientes.schema.js';
import Pedido from '../models/Pedido.js';

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
  const criterios = [];

  if (datos.dni) criterios.push({ dni: datos.dni });
  if (datos.email) criterios.push({ email: datos.email });
  if (datos.telefono) criterios.push({ telefono: datos.telefono });

  if (criterios.length) {
    const clienteExistente = await Cliente.findOne({ $or: criterios });

    if (clienteExistente) {
      if (clienteExistente.estado === 0) {
        throw new Error('El cliente ya existe y está dado de baja (estado 0)');
      }
      throw new Error('El cliente ya existe');
    }
  }

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

  if (!cliente) {
    throw new Error('Cliente no encontrado');
  }

  // 1. Validar que no tenga pedidos activos
    const tienePedidosActivos = await Pedido.findOne({
    clienteId: id,
    estado: { $in: ['Pendiente', 'En Producción'] }
  });

  if (tienePedidosActivos) {
    throw new Error('No se puede dar de baja: El cliente tiene pedidos en curso.');
  }

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
