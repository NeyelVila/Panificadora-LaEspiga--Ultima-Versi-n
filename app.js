// ES Modules -> import 
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './src/middleware/logger.middleware.js';
import {errorHandler} from './src/middleware/errorHandler.middleware.js';
import Cliente from './src/models/clientes.schema.js';
import Pedido from './src/models/Pedido.js';
import Insumo from './src/models/Insumo.js';


const app = express();

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ********* Middlewares ***************
// le dice al servidor que entienda JSON en el body de las requests
app.use(express.json());
// formularios HTML
app.use(express.urlencoded({ extended: true }));

// Configurar sesión
app.use(session({
  secret: process.env.JWT_SECRET || 'clave_secreta_de_respaldo',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    maxAge: 1000 * 60 * 60 * 2 // 2 horas
  }
}));

// servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));
// ********* Middlewares ***************

// Configura la carpeta de vistas y el motor de plantillas Pug
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware de logger personalizado
app.use(logger);

// Ruta de ejemplo para renderizar una vista pug
app.get('/', async (req, res) => {
  try {
    // Contamos clientes activos (estado: 1)
    const clientesActivos = await Cliente.countDocuments({ estado: 1 });
    
    // Contamos todos los pedidos (podríamos filtrar por fecha luego)
    const pedidosMes = await Pedido.countDocuments();
    
    // Calculamos alertas de stock (Insumos que están por debajo de su stock mínimo)
    const insumos = await Insumo.find();
    const alertasStock = insumos.filter(insumo => insumo.stockActual <= insumo.stockMinimo).length;

    // Le enviamos a Pug la página 'index' junto con las variables reales
    res.render('index', { 
      clientesActivos, 
      pedidosMes, 
      alertasStock 
    });
  } catch (error) {
    console.error("Error cargando el dashboard:", error);
    res.status(500).send("Error al cargar el panel de control");
  }
});

// ==========================================
// IMPORTACIÓN DE RUTAS (Ahora con import y .js)
// ==========================================
import facturacionRoutes from './src/routes/facturacion.routes.js';
import clientesRoutes from './src/routes/clientes.routes.js';
import productosRoutes from './src/routes/productos.routes.js';
import pedidosRoutes from './src/routes/pedidos.routes.js'; 
import insumosRoutes from './src/routes/insumos.routes.js';
import recetasRoutes from './src/routes/recetas.routes.js';
import authRoutes from './src/routes/auth.routes.js';

// Rutas de autenticación
app.use('/auth', authRoutes);

// USO DE RUTAS
app.use('/facturacion', facturacionRoutes);
app.use('/clientes', clientesRoutes);
app.use('/productos', productosRoutes);
app.use('/pedidos', pedidosRoutes);
app.use('/insumos', insumosRoutes);
app.use('/recetas', recetasRoutes);


// Rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador global de errores (500)
app.use(errorHandler);

// exporta con ES Modules
export default app;