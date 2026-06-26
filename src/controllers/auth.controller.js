import Usuario from '../models/Usuario.js';
import bcrypt from 'bcrypt';

// CAMBIO 1: Añadimos 'next' a los parámetros de todas las funciones
export const registrar = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: hashedPassword,
      rol
    });

    await nuevoUsuario.save();
    res.status(201).send("Usuario registrado con éxito. Ya puedes iniciar sesión.");
  } catch (error) {
    // CAMBIO 2: Usamos next(error) en lugar de res.status().send()
    // Esto hace que el error pase por tu middleware centralizado
    next(error); 
  }
};

export const login = async (req, res, next) => { // CAMBIO 1: Añadido 'next'
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      // Opcional: Puedes asignar un status al error para que el middleware lo sepa
      const error = new Error("Usuario no encontrado");
      error.status = 404;
      return next(error);
    }

    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) {
      const error = new Error("Contraseña incorrecta");
      error.status = 401;
      return next(error);
    }

    req.session.usuario = {
      id: usuario._id,
      nombre: usuario.nombre,
      rol: usuario.rol
    };

    res.redirect('/productos/view'); 
  } catch (error) {
    next(error); 
  }
};

export const logout = (req, res, next) => { // CAMBIO 1: Añadido 'next'
  req.session.destroy((err) => {
    if (err) return next(err); // CAMBIO 3: Manejo de error al destruir sesión
    res.redirect('/auth/login');
  });
};