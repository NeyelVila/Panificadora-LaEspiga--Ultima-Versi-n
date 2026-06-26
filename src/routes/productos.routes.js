// commonjs
/*
const { Router } = require('express');
const productosController = require('../controllers/productos.controller');
*/
// ES Modules
import { Router } from 'express';
import productosController from '../controllers/productos.controller.js';
import { requerirAutenticacion, requerirAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// ==========================================
// 1. RUTAS WEB (Siempre arriba)
// ==========================================
router.get('/view', requerirAutenticacion, productosController.listarParaWeb);
router.get('/nuevo', requerirAutenticacion, productosController.renderizarFormulario);
router.post('/crear-web', requerirAutenticacion, productosController.crearDesdeWeb);
router.post('/baja-web/:id', requerirAutenticacion, productosController.bajaDesdeWeb);
router.get('/:id/receta', requerirAutenticacion, productosController.verRecetaWeb);
router.get('/:id/nueva-receta', requerirAutenticacion, productosController.renderizarNuevaReceta);
router.post('/:id/crear-receta', requerirAutenticacion, productosController.crearRecetaParaProductoWeb);
router.get('/editar-web/:id', requerirAutenticacion, productosController.renderizarEdicionWeb);
router.post('/actualizar-web/:id', requerirAutenticacion, productosController.actualizarDesdeWeb);


// ==========================================
// 2. RUTAS API / THUNDER CLIENT (Abajo)
// ==========================================
router.get('/', requerirAutenticacion, productosController.obtenerTodos);
router.post('/', requerirAutenticacion, productosController.crear);
router.delete('/:id', requerirAutenticacion, productosController.darDeBaja); 

export default router;
// commonjs
// module.exports = router;
// ES Modules

