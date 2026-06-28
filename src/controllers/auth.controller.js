import Usuario from '../models/Usuario.js';
import bcrypt from 'bcrypt';

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
    // Esto hace que el error pase por el middleware centralizado
    next(error); 
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
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

    res.redirect('/'); 
  } catch (error) {
    next(error); 
  }
};

export const logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.redirect('/auth/login');
  });
};