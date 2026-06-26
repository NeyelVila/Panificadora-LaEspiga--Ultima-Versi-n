// Middleware para verificar que el usuario esté logueado
export const requerirAutenticacion = (req, res, next) => {
  if (req.session && req.session.usuario) {
    // Si existe la sesión, guardamos los datos del usuario en res.locals 
    // para que Pug pueda acceder a ellos (ej. mostrar el nombre en el menú)
    res.locals.usuario = req.session.usuario;
    return next();
  }
  
  // Si no está logueado, lo rebotamos al formulario de login
  res.redirect('/auth/login');
};

// Middleware opcional por si quieren proteger rutas solo para el Administrador
export const requerirAdmin = (req, res, next) => {
  if (req.session && req.session.usuario && req.session.usuario.rol === 'admin') {
    return next();
  }
  
  res.status(403).send('Acceso denegado: Se requieren permisos de administrador.');
};