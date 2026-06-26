// EcmaScript Modules (ESM)
// 1. Cargar variables de entorno (con esta sola línea alcanza en ESM)
import 'dotenv/config'; 

// 2. Importar la app y la base de datos
import app from './app.js';
import { conectarDB } from './src/config/db.js';

const PORT = process.env.PORT || 3000;

console.log(`Servidor inicializando...`);

// 3. Primero conectamos la Base de Datos
await conectarDB();

// 4. Si la BD conectó bien, levantamos el servidor
app.listen(PORT, () => {
  console.log(`Servidor de La Espiga de Oro corriendo en http://localhost:${PORT}`);
});