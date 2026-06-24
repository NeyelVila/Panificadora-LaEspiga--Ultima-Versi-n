//const { Router } = require('express');
//const insumosController = require('../controllers/insumos.controller');
//const router = Router();
import { Router } from 'express';
import insumosController from '../controllers/insumos.controller.js';
const router = Router();

// 1. RUTAS WEB

router.get('/view', insumosController.listarParaWeb);
router.get('/nuevo', insumosController.renderizarFormulario);
router.post('/crear-web', insumosController.crearDesdeWeb);
router.get('/:id/ingreso', insumosController.renderizarIngreso);
router.post('/ingreso-web/:id', insumosController.ingresarStockWeb);

// 2. RUTAS API

router.get('/', insumosController.obtenerTodos);
router.post('/', insumosController.crear);

//module.exports = router;
export default router;