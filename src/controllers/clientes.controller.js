// EcmaScript Modules - importación de funciones desde el servicio de clientes
import {
  getClientesActivos,
  getClientesActivosPorId,
  crearCliente,
  eliminarCliente,
  actualizarCliente,
} from "../services/clientes.service.js";

const getClientes = async (req, res) => {
  try {
    const clientesActivos = await getClientesActivos();
    res.render("clientes", {
      title: "Clientes",
      clientes: clientesActivos,
    });
  } catch (error) {
    next(error); // Pasamos el error al middleware global de manejo de errores
  }
};

const getNuevoCliente = (req, res) => {
  res.render('clientes_form');
};

const getClienteEditar = async (req, res, next) => {
  try {
    const id = req.params.id;
    const cliente = await getClientesActivosPorId(id);
    if (!cliente) {
      return res
      .status(404)
      .json({ error: "Cliente no encontrado" });
    }

    res.render('clientes_edit', { cliente });

  } catch (error) {
    next(error); // Pasamos el error al middleware global de manejo de errores
  }
};

const postCliente = async (req, res, next) => {
  try {
    const { 
      nombre, 
      email, 
      tipo, 
      direccion, 
      telefono 
    } = req.body;

    if (
      !nombre || 
      !email || 
      !tipo || 
      !direccion || 
      !telefono
    ) {
      return res
      .status(400)
      .send("Faltan datos");
    }
    await crearCliente(req.body);
    res.redirect('/clientes/view');

  } catch (error) {
    next(error); // Pasamos el error al middleware global de manejo de errores
  }
};

const deleteCliente = async(req, res, next) => {
  try {
    // agarra la id del cliente a eliminar desde los parámetros de la URL
    const id = req.params.id;
    await eliminarCliente(id);
    res.redirect('/clientes/view');

  } catch (error) {
    next(error); // Pasamos el error al middleware global de manejo de errores
  }
};

const putCliente = async(req, res, next) => {
  try {
    const id = req.params.id;

    const { 
      nombre, 
      email, 
      tipo, 
      direccion, 
      telefono
    } = req.body;

    await actualizarCliente(id, {
      nombre,
      email,
      tipo,
      direccion,
      telefono,
    });

    res.redirect('/clientes/view');

  } catch (error) {
    next(error); // Pasamos el error al middleware global de manejo de errores
  }
};

// ES Modules - no poner default si se exportan varias cosas
export { 
  getClientes, 
  getNuevoCliente,
  getClienteEditar,
  postCliente, 
  deleteCliente, 
  putCliente };
