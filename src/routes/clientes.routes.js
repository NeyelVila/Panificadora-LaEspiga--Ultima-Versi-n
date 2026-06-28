// ECMAScript Modules
import express from 'express';
import { 
  getClientes, 
  getNuevoCliente,
  getClienteEditar,
  postCliente, 
  deleteCliente, 
  putCliente
} from '../controllers/clientes.controller.js';

import { getClientesActivos } from '../services/clientes.service.js';
import { requerirAutenticacion, requerirAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// LISTAR
router.get('/', requerirAutenticacion, getClientes);
router.get('/view', requerirAutenticacion, getClientes);

// FORM CREAR
router.get('/nuevo', requerirAutenticacion, getNuevoCliente);

// CREAR CLIENTE
router.post('/', requerirAutenticacion, postCliente);
router.post('/crear', requerirAutenticacion, postCliente);

// ELIMINAR
router.post('/:id/eliminar', requerirAutenticacion, deleteCliente);
router.post('/eliminar/:id', requerirAutenticacion, deleteCliente);

// FORM EDITAR
router.get('/:id/editar', requerirAutenticacion, getClienteEditar);
router.get('/editar/:id', requerirAutenticacion, getClienteEditar);

// ACTUALIZAR (Cambiamos a '/actualizar/:id' para que coincida con el action)
router.post('/actualizar/:id', requerirAutenticacion, putCliente);

// ECMAScript Modules
export default router;
