// commonjs 
//const productosService = require('../services/productos.service');
// ES Modules
import productosService from '../services/productos.service.js';
import Receta from '../models/Receta.js';
import Producto from '../models/Producto.js';
import Insumo from '../models/Insumo.js';

class ProductosController {
  obtenerTodos = (req, res) => {
    try {
      const productos = productosService.obtenerTodos();
      res.status(200).json({ error: false, data: productos });
    } catch (error) {
      res.status(500).json({ error: true, mensaje: error.message });
    }
  };

    crear = async (req, res) => {
    try {
      // AQUÍ ESTÁ LA CLAVE: Hay que pasarle el req.body al servicio
      const nuevoProducto = await productosService.crear(req.body); 
      res.status(201).json({ error: false, data: nuevoProducto });
    } catch (error) {
      res.status(400).json({ error: true, mensaje: error.message });
    }
  };

  darDeBaja = (req, res) => {
    try {
      const producto = productosService.darDeBaja(req.params.id);
      res.status(200).json({ error: false, data: producto, mensaje: "Producto desactivado correctamente." });
    } catch (error) {
      res.status(400).json({ error: true, mensaje: error.message });
    }
  };
  listarParaWeb = async (req, res) => {
  try {
    const productos = await productosService.obtenerTodos();
    // 'productos' es el nombre del archivo productos.pug
    // { productos } es el objeto con los datos que le pasamos a Pug
    res.render('productos', { productos }); 
  } catch (error) {
    res.status(500).send("Error al cargar la página de productos");
  }
  };
  // Muestra la pantalla del formulario
   renderizarFormulario = async (req, res) => {
    try {
     // Buscamos todos los insumos activos para llenar los selectores del formulario
     const insumos = await Insumo.find({ activo: true });
     res.render('productos_form', { insumos });
    } catch (error) {
    res.status(500).send("Error al cargar el formulario");
    }
   };

  // Recibe los datos del form HTML, crea el producto y redirecciona
  crearDesdeWeb = async (req, res) => {
  try {
    const { nombre, categoria, precio, insumos, cantidades } = req.body;

    // 1. Creamos el producto
    const nuevoProducto = await productosService.crear({ nombre, categoria, precio });

    // 2. Armamos el array de ingredientes para la receta
    // Filtramos por si acaso hay campos vacíos y mapeamos
    const ingredientesData = [];
    if (insumos && insumos.length > 0) {
      for (let i = 0; i < insumos.length; i++) {
        if (insumos[i] && cantidades[i]) {
          ingredientesData.push({
            insumoId: insumos[i],
            cantidad: parseFloat(cantidades[i])
          });
        }
      }

      // 3. Creamos la receta vinculada al nuevo producto
      await Receta.create({
        productoId: nuevoProducto._id,
        ingredientes: ingredientesData
      });
    }

    res.redirect('/productos/view');
  } catch (error) {
    res.status(400).send("Error al crear: " + error.message);
  }
};

  // Ejecuta la baja lógica y recarga la tabla
  bajaDesdeWeb = async (req, res) => {
    try {
      await productosService.darDeBaja(req.params.id);
      res.redirect('/productos/view');
    } catch (error) {
      // Si tira error de regla de negocio (ej. "Está en un pedido en curso")
      res.status(400).send(error.message); 
    }
  };

  // Busca la receta y muestra la vista
  verRecetaWeb = async (req, res) => {
    try {
      const producto = await Producto.findById(req.params.id);
      // Usamos populate para traer los nombres de los insumos
      const receta = await Receta.findOne({ productoId: req.params.id }).populate('ingredientes.insumoId');
      
      res.render('receta_detalle', { producto, receta });
    } catch (error) {
      res.status(500).send("Error al cargar la receta");
    }
  };
  // Muestra el formulario para adjudicar una receta a un producto existente
  renderizarNuevaReceta = async (req, res) => {
    try {
      const producto = await Producto.findById(req.params.id);
      const insumos = await Insumo.find({ activo: true });
      
      if (!producto) return res.status(404).send("Producto no encontrado");
      
      res.render('recetas_form', { producto, insumos });
    } catch (error) {
      res.status(500).send("Error al cargar el formulario: " + error.message);
    }
  };

  // Recibe los datos y guarda la receta en la base de datos
  crearRecetaParaProductoWeb = async (req, res) => {
    try {
      const { insumos, cantidades } = req.body;
      const productoId = req.params.id;

      const ingredientesData = [];
      if (insumos && insumos.length > 0) {
        // Normalizamos a arrays por si viene un solo ingrediente
        const ids = Array.isArray(insumos) ? insumos : [insumos];
        const cants = Array.isArray(cantidades) ? cantidades : [cantidades];

        for (let i = 0; i < ids.length; i++) {
          if (ids[i] && cants[i]) {
            ingredientesData.push({
              insumoId: ids[i],
              cantidad: parseFloat(cants[i])
            });
          }
        }

        // Creamos la receta vinculada a este producto
        await Receta.create({
          productoId: productoId,
          ingredientes: ingredientesData
        });
      }

      // Redirigimos a la vista de la receta para que vea el resultado
      res.redirect(`/productos/${productoId}/receta`);
    } catch (error) {
      res.status(400).send("Error al guardar la receta: " + error.message);
    }
  };
 };



// commonjs
// module.exports = new ProductosController();
// ES Modules
export default new ProductosController();