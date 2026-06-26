//const insumosService = require('../services/insumos.service');
import insumosService from '../services/insumos.service.js';
import Insumo from '../models/Insumo.js';

class InsumosController {
  obtenerTodos = (req, res) => {
    try {
      const insumos = insumosService.obtenerTodos();
      res.status(200).json({ error: false, data: insumos });
    } catch (error) {
      next(error); // Pasamos el error al middleware global de manejo de errores
    }
  };

  crear = (req, res) => {
    try {
      const nuevoInsumo = insumosService.crear(req.body);
      res.status(201).json({ error: false, data: nuevoInsumo });
    } catch (error) {
      next(error); // Pasamos el error al middleware global de manejo de errores
    }
  };

  darDeBaja = (req, res) => {
    try {
      const insumo = insumosService.darDeBaja(req.params.id);
      res.status(200).json({ error: false, data: insumo, mensaje: "Insumo desactivado correctamente." });
    } catch (error) {
      next(error); // Pasamos el error al middleware global de manejo de errores
    }
  };
  listarParaWeb = async (req, res) => {
    try {
      // Obtenemos todos los insumos usando tu servicio actual
      const insumos = await insumosService.obtenerTodos();
      res.render('insumos', { insumos });
    } catch (error) {
      next(error); // Pasamos el error al middleware global de manejo de errores
    }
  };
  renderizarFormulario = (req, res) => {
    res.render('insumos_form');
  };

  // 2. Recibir datos y crear insumo nuevo
  crearDesdeWeb = async (req, res) => {
    try {
      await insumosService.crear(req.body);
      res.redirect('/insumos/view');
    } catch (error) {
      next(error); // Pasamos el error al middleware global de manejo de errores
    }
  };

  // 3. Mostrar pantalla para sumar stock
  renderizarIngreso = async (req, res) => {
    try {
      const insumo = await Insumo.findById(req.params.id);
      if (!insumo) return res.status(404).send("Insumo no encontrado");
      
      res.render('insumo_ingreso', { insumo });
    } catch (error) {
      next(error); // Pasamos el error al middleware global de manejo de errores
    }
  };

  // 4. Sumar matemáticamente la cantidad al stock actual
  ingresarStockWeb = async (req, res) => {
    try {
      const { id } = req.params;
      const cantidadNueva = parseFloat(req.body.cantidadNueva);

      const insumo = await Insumo.findById(id);
      insumo.stockActual += cantidadNueva; // Sumamos la mercadería
      await insumo.save();

      res.redirect('/insumos/view');
    } catch (error) {
      next(error); // Pasamos el error al middleware global de manejo de errores
    }
  };
}

export default new InsumosController();