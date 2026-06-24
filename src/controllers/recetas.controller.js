//const recetasService = require('../services/recetas.service');
import recetasService from '../services/recetas.service.js';

class RecetasController {
  obtenerTodas = (req, res) => {
    try {
      const recetas = recetasService.obtenerTodas();
      res.status(200).json({ error: false, data: recetas });
    } catch (error) {
      res.status(500).json({ error: true, mensaje: error.message });
    }
  };

  obtenerPorProducto = (req, res) => {
    try {
      const receta = recetasService.obtenerPorProducto(req.params.productoId);
      if (!receta) return res.status(404).json({ error: true, mensaje: "Receta no encontrada" });
      res.status(200).json({ error: false, data: receta });
    } catch (error) {
      res.status(500).json({ error: true, mensaje: error.message });
    }
  };

  crear = (req, res) => {
    try {
      const nuevaReceta = recetasService.crear(req.body);
      res.status(201).json({ error: false, data: nuevaReceta });
    } catch (error) {
      res.status(400).json({ error: true, mensaje: error.message });
    }
  };
}

export default new RecetasController();