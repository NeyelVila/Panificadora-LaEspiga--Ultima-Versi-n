//const { Router } = require('express');
//const recetasController = require('../controllers/recetas.controller');
//const router = Router();
import { Router } from 'express';
import recetasController from '../controllers/recetas.controller.js';
import { requerirAutenticacion, requerirAdmin } from '../middleware/auth.middleware.js';
const router = Router();

router.get('/', requerirAutenticacion, recetasController.obtenerTodas);
router.get('/producto/:productoId', requerirAutenticacion, recetasController.obtenerPorProducto);
router.post('/', requerirAutenticacion, requerirAdmin, recetasController.crear);

//module.exports = router;
export default router;