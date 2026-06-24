//const insumosService = require('../services/insumos.service');
import insumosService from '../services/insumos.service.js';
import Insumo from '../models/Insumo.js';

class InsumosController {
  obtenerTodos = (req, res) => {
    try {
      const insumos = insumosService.obtenerTodos();
      res.status(200).json({ error: false, data: insumos });
    } catch (error) {
      res.status(500).json({ error: true, mensaje: error.message });
    }
  };

  crear = (req, res) => {
    try {
      const nuevoInsumo = insumosService.crear(req.body);
      res.status(201).json({ error: false, data: nuevoInsumo });
    } catch (error) {
      res.status(400).json({ error: true, mensaje: error.message });
    }
  };

  darDeBaja = (req, res) => {
    try {
      const insumo = insumosService.darDeBaja(req.params.id);
      res.status(200).json({ error: false, data: insumo, mensaje: "Insumo desactivado correctamente." });
    } catch (error) {
      res.status(400).json({ error: true, mensaje: error.message });
    }
  };
  listarParaWeb = async (req, res) => {
    try {
      // Obtenemos todos los insumos usando tu servicio actual
      const insumos = await insumosService.obtenerTodos();
      res.render('insumos', { insumos });
    } catch (error) {
      res.status(500).send("Error al cargar la página de stock");
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
      res.status(400).send("Error al crear insumo: " + error.message);
    }
  };

  // 3. Mostrar pantalla para sumar stock
  renderizarIngreso = async (req, res) => {
    try {
      const insumo = await Insumo.findById(req.params.id);
      if (!insumo) return res.status(404).send("Insumo no encontrado");
      
      res.render('insumo_ingreso', { insumo });
    } catch (error) {
      res.status(500).send("Error al cargar la página: " + error.message);
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
      res.status(400).send("Error al actualizar inventario: " + error.message);
    }
  };
}

export default new InsumosController();