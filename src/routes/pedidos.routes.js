// commonjs
/*
const { Router } = require('express');
const pedidosController = require('../controllers/pedidos.controller');
*/

// ES Modules
import { Router } from 'express';
import pedidosController from '../controllers/pedidos.controller.js';
import { requerirAutenticacion, requerirAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// ==========================================
// 1. RUTAS WEB
// ==========================================
router.get('/view', requerirAutenticacion, pedidosController.listarParaWeb);
router.get('/nuevo', requerirAutenticacion, pedidosController.renderizarFormulario);
router.post('/crear-web', requerirAutenticacion, pedidosController.crearDesdeWeb);   
router.get('/:id/detalle', requerirAutenticacion, pedidosController.verDetalleWeb);
router.post('/estado-web/:id', requerirAutenticacion, pedidosController.cambiarEstadoWeb);
router.post('/avanzar/:id', requerirAutenticacion, pedidosController.avanzarEstadoPedido);
router.post('/cancelar/:id', requerirAutenticacion, pedidosController.cancelarPedido);
router.post('/asignar-despacho/:id', requerirAutenticacion, pedidosController.asignarHorarioYDespachar);

// ==========================================
// 2. RUTAS API / THUNDER CLIENT
// ==========================================
router.get('/', requerirAutenticacion, pedidosController.obtenerTodos);
router.post('/', requerirAutenticacion, pedidosController.crear);
router.patch('/:id/estado', requerirAutenticacion, pedidosController.actualizarEstado);

export default router;
// commonjs
// module.exports = router;
// ES Modules
