// commonjs
/*
const { Router } = require('express');
const pedidosController = require('../controllers/pedidos.controller');
*/

// ES Modules
import { Router } from 'express';
import pedidosController from '../controllers/pedidos.controller.js';

const router = Router();

// ==========================================
// 1. RUTAS WEB
// ==========================================
router.get('/view', pedidosController.listarParaWeb);
router.get('/nuevo', pedidosController.renderizarFormulario);
router.post('/crear-web', pedidosController.crearDesdeWeb);   
router.get('/:id/detalle', pedidosController.verDetalleWeb);
router.post('/estado-web/:id', pedidosController.cambiarEstadoWeb);

// ==========================================
// 2. RUTAS API / THUNDER CLIENT
// ==========================================
router.get('/', pedidosController.obtenerTodos);
router.post('/', pedidosController.crear);

export default router;
// commonjs
// module.exports = router;
// ES Modules
