// EcmaScript Modules (ESM)
import 'dotenv/config';
import app from './app.js';
import {conectarDB} from './src/config/db.js';

const PORT = process.env.PORT || 3000;

await conectarDB();

console.log(`Servidor inicializando...`);

// arranca el servidor en el puerto definido
app.listen(PORT, () => {
  console.log(`Servidor de La Espiga de Oro corriendo en http://localhost:${PORT}`);
});
