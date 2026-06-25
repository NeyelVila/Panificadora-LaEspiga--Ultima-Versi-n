// commonjs
/*
const { Router } = require('express');
const productosController = require('../controllers/productos.controller');
*/
// ES Modules
import { Router } from 'express';
import productosController from '../controllers/productos.controller.js';

const router = Router();

// ==========================================
// 1. RUTAS WEB (Siempre arriba)
// ==========================================
router.get('/view', productosController.listarParaWeb);
router.get('/nuevo', productosController.renderizarFormulario);
router.post('/crear-web', productosController.crearDesdeWeb);
router.post('/baja-web/:id', productosController.bajaDesdeWeb);
router.get('/:id/receta', productosController.verRecetaWeb);
router.get('/:id/nueva-receta', productosController.renderizarNuevaReceta);
router.post('/:id/crear-receta', productosController.crearRecetaParaProductoWeb);
router.get('/editar-web/:id', productosController.renderizarEdicionWeb);
router.post('/actualizar-web/:id', productosController.actualizarDesdeWeb);


// ==========================================
// 2. RUTAS API / THUNDER CLIENT (Abajo)
// ==========================================
router.get('/', productosController.obtenerTodos);
router.post('/', productosController.crear);
router.delete('/:id', productosController.darDeBaja); 

export default router;
// commonjs
// module.exports = router;
// ES Modules

