//const recetasService = require('../services/recetas.service');
import recetasService from '../services/recetas.service.js';

class RecetasController {
  obtenerTodas = (req, res) => {
    try {
      const recetas = recetasService.obtenerTodas();
      res.status(200).json({ error: false, data: recetas });
    } catch (error) {
     next(error); // Pasamos el error al middleware global de manejo de errores 
    }
  };

  obtenerPorProducto = (req, res) => {
    try {
      const receta = recetasService.obtenerPorProducto(req.params.productoId);
      if (!receta) return res.status(404).json({ error: true, mensaje: "Receta no encontrada" });
      res.status(200).json({ error: false, data: receta });
    } catch (error) {
      next(error); // Pasamos el error al middleware global de manejo de errores
    }
  };

  crear = (req, res) => {
    try {
      const nuevaReceta = recetasService.crear(req.body);
      res.status(201).json({ error: false, data: nuevaReceta });
    } catch (error) {
      next(error); // Pasamos el error al middleware global de manejo de errores  
    }
  };
}

export default new RecetasController();