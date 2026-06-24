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
    res.status(500).json({ error: "No se pudieron obtener los clientes" });
  }
};

const getNuevoCliente = (req, res) => {
  res.render('clientes_form');
};

const getClienteEditar = async (req, res) => {
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
    res.status(500)
    .json({ error: "No se pudo obtener el cliente" });
  }
};

const postCliente = async (req, res) => {
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
    res.redirect('/clientes');

  } catch (error) {
    console.log(error);
     if (error.name === 'ValidationError') {
        const mensajes = Object.values(error.errors).map(e => e.message);
        return res.status(400).json({ error: mensajes });
    }
    res.status(500).json({ error: "No se pudo crear el cliente" });
  }
};

const deleteCliente = async(req, res) => {
  try {
    // agarra la id del cliente a eliminar desde los parámetros de la URL
    const id = req.params.id;
    await eliminarCliente(id);
    res.redirect('/clientes');

  } catch (error) {
    res.status(500).json({ error: "No se pudo eliminar el cliente" });
  }
};

const putCliente = async(req, res) => {
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

    res.redirect('/clientes');

  } catch (error) {
    res.status(500).json({ error: "No se pudo actualizar el cliente" });
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
