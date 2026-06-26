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

// LISTAR (Cambiamos '/' por '/view' para que coincida con la URL)
router.get('/view', requerirAutenticacion, getClientes);

// FORM CREAR
router.get('/nuevo', requerirAutenticacion, getNuevoCliente);

// CREAR CLIENTE (Cambiamos '/' por '/crear' para que coincida con action="/clientes/crear")
router.post('/crear', requerirAutenticacion, postCliente);

// ELIMINAR (Invertimos el orden a '/eliminar/:id' para coincidir con el form)
router.post('/eliminar/:id', requerirAutenticacion, deleteCliente);

// FORM EDITAR (Invertimos a '/editar/:id')
router.get('/editar/:id', requerirAutenticacion, getClienteEditar);

// ACTUALIZAR (Cambiamos a '/actualizar/:id' para que coincida con el action)
router.post('/actualizar/:id', requerirAutenticacion, putCliente);

// ECMAScript Modules
export default router;