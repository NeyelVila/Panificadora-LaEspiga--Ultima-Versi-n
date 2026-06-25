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
      // ¿Estás seguro que 'productosService.obtenerTodos()' trae el modelo Mongoose?
      // Si el servicio hace un .lean(), a veces los campos nuevos no se ven si no se actualizaron.
      const productos = await Producto.find().lean(); 
      res.render('productos', { productos }); 
    } catch (error) {
      res.status(500).send("Error");
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
      const { id } = req.params;
      
      // Intentamos eliminar el producto por su ID
      const productoEliminado = await Producto.findByIdAndDelete(id);

      if (!productoEliminado) {
        return res.status(404).send("Producto no encontrado para eliminar");
      }

      // Redirigimos a la ruta donde vive la tabla de productos
      res.redirect('/productos/view'); 
    } catch (error) {
      console.error("🔴 ERROR AL ELIMINAR:", error);
      res.status(400).send("Error al eliminar el producto: " + error.message); 
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
  // Muestra la pantalla con los datos cargados
  renderizarEdicionWeb = async (req, res) => {
    try {
      const { id } = req.params;
      const producto = await Producto.findById(id); 
      
      if (!producto) {
        return res.status(404).send("Producto no encontrado");
      }

      res.render('productos_edit', { producto });
    } catch (error) {
      console.error("🔴 Error al cargar edición:", error);
      res.status(500).send("Error al cargar el formulario de edición");
    }
  };

  // Atrapa los datos nuevos y los guarda
  actualizarDesdeWeb = async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, precio } = req.body; 

      await Producto.findByIdAndUpdate(id, { nombre, precio });
      res.redirect('/productos/view');

    } catch (error) {
      console.error("🔴 Error al actualizar:", error);
      res.status(500).send("Error al actualizar el producto");
    }
  };


 };



// commonjs
// module.exports = new ProductosController();
// ES Modules
export default new ProductosController();