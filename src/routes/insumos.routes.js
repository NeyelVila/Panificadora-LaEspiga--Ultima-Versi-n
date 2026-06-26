//const { Router } = require('express');
//const insumosController = require('../controllers/insumos.controller');
//const router = Router();
import { Router } from 'express';
import insumosController from '../controllers/insumos.controller.js';
import { requerirAutenticacion, requerirAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// 1. RUTAS WEB

router.get('/view', requerirAutenticacion, insumosController.listarParaWeb);
router.get('/nuevo', requerirAutenticacion, insumosController.renderizarFormulario);
router.post('/crear-web', requerirAutenticacion, insumosController.crearDesdeWeb);
router.get('/:id/ingreso', requerirAutenticacion, insumosController.renderizarIngreso);
router.post('/ingreso-web/:id', requerirAutenticacion, insumosController.ingresarStockWeb);

// 2. RUTAS API

router.get('/', requerirAutenticacion, insumosController.obtenerTodos);
router.post('/', requerirAutenticacion, insumosController.crear);

//module.exports = router;
export default router;