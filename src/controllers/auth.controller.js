import Usuario from '../models/Usuario.js';
import bcrypt from 'bcrypt';

// Función para registrar un nuevo usuario
export const registrar = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // 1. Encriptar la contraseña (hash)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Crear y guardar el usuario
    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: hashedPassword,
      rol
    });

    await nuevoUsuario.save();
    res.status(201).send("Usuario registrado con éxito. Ya puedes iniciar sesión.");
  } catch (error) {
    res.status(500).send("Error al registrar: " + error.message);
  }
};

// Función para iniciar sesión
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar si el usuario existe
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).send("Usuario no encontrado");
    }

    // 2. Comparar la contraseña ingresada con la encriptada en la BD
    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) {
      return res.status(401).send("Contraseña incorrecta");
    }

    // 3. Crear la sesión del usuario
    req.session.usuario = {
      id: usuario._id,
      nombre: usuario.nombre,
      rol: usuario.rol
    };

    // 4. Redirigir al sistema una vez logueado
    res.redirect('/productos/view'); 
  } catch (error) {
    next(error); // Pasamos el error al middleware global de manejo de errores
  }
};

// Función para cerrar sesión
export const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login'); // Te lleva a la vista de login (que crearemos luego)
  });
};