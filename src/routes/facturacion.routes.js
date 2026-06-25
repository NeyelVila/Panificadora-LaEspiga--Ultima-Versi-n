import { Router } from 'express';
import facturacionController from '../controllers/facturacion.controller.js';

const router = Router();

// ¡Le agregamos el /view aquí!
router.get('/view', facturacionController.listarPendientesCobro); 
router.post('/cobrar/:id', facturacionController.cobrarEfectivo);

export default router;