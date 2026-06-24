//const { Router } = require('express');
//const recetasController = require('../controllers/recetas.controller');
//const router = Router();
import { Router } from 'express';
import recetasController from '../controllers/recetas.controller.js';
const router = Router();

router.get('/', recetasController.obtenerTodas);
router.get('/producto/:productoId', recetasController.obtenerPorProducto);
router.post('/', recetasController.crear);

//module.exports = router;
export default router;