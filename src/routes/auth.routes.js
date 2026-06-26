import express from 'express';
import { registrar, login, logout } from '../controllers/auth.controller.js';

const router = express.Router();

// Rutas para procesar datos (POST)
router.post('/registro', registrar);
router.post('/login', login);

// Ruta para cerrar sesión (GET)
router.get('/logout', logout);

// Ruta para mostrar la vista del formulario (GET)
router.get('/login', (req, res) => {
  // Si el usuario ya está logueado, lo mandamos directo a productos
  if (req.session && req.session.usuario) {
    return res.redirect('/productos/view');
  }
  res.render('login', { title: 'Iniciar Sesión - La Espiga de Oro' }); 
});

export default router;