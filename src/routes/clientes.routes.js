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

const router = express.Router();

// LISTAR
router.get('/', getClientes);

// FORM CREAR
router.get('/nuevo', getNuevoCliente);
// crear cliente
router.post('/', postCliente);

// ELIMINAR
router.post('/:id/eliminar', deleteCliente);

// FORM EDITAR
router.get('/:id/editar', getClienteEditar);

// EDITAR
router.post('/:id/editar', putCliente);

// ECMAScript Modules
export default router;