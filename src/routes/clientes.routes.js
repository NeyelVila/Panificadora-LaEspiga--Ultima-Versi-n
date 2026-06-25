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

// LISTAR (Cambiamos '/' por '/view' para que coincida con la URL)
router.get('/view', getClientes);

// FORM CREAR
router.get('/nuevo', getNuevoCliente);

// CREAR CLIENTE (Cambiamos '/' por '/crear' para que coincida con action="/clientes/crear")
router.post('/crear', postCliente);

// ELIMINAR (Invertimos el orden a '/eliminar/:id' para coincidir con el form)
router.post('/eliminar/:id', deleteCliente);

// FORM EDITAR (Invertimos a '/editar/:id')
router.get('/editar/:id', getClienteEditar);

// ACTUALIZAR (Cambiamos a '/actualizar/:id' para que coincida con el action)
router.post('/actualizar/:id', putCliente);

// ECMAScript Modules
export default router;