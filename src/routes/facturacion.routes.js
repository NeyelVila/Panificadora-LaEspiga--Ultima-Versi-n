//const { Router } = require('express');
//const facturacionController = require('../controllers/facturacion.controller');

//const router = Router();
import { Router } from 'express';
import facturacionController from '../controllers/facturacion.controller.js';
const router = Router();

// Endpoint para obtener lo que debe cada franquicia
router.get('/franquicias', facturacionController.obtenerReporte);

export default router;