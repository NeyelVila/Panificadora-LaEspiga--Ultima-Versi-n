import { Router } from 'express';
import facturacionController from '../controllers/facturacion.controller.js';
import { requerirAutenticacion, requerirAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/view', requerirAutenticacion, facturacionController.listarPendientesCobro); 
router.post('/cobrar/:id', requerirAutenticacion, facturacionController.cobrarEfectivo);

export default router;