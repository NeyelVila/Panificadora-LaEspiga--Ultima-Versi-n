import Insumo from '../models/Insumo.js';

class InsumosService {
  async obtenerTodos() {
    return await Insumo.find({ activo: true });
  }

  async crear(datos) {
    const nuevoInsumo = new Insumo(datos);
    return await nuevoInsumo.save();
  }

  async darDeBaja(id) {
    return await Insumo.findByIdAndUpdate(id, { activo: false }, { new: true });
  }
}

export default new InsumosService();

// ##########CODIGO ANTERIOR CON ARCHIVOS JSON (SIN BASE DE DATOS)##########
// import fs from 'fs';
// import path from 'path';
// import crypto from 'crypto';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const insumosPath = path.join(__dirname, '../data/insumos.json');

// const leerInsumos = () => {
//   if (!fs.existsSync(insumosPath)) fs.writeFileSync(insumosPath, '[]', 'utf-8');
//   return JSON.parse(fs.readFileSync(insumosPath, 'utf-8'));
// };

// const guardarInsumos = (datos) => {
//   fs.writeFileSync(insumosPath, JSON.stringify(datos, null, 2));
// };

// class InsumosService {
//   obtenerTodos() {
//     const insumos = leerInsumos();
//     return insumos.filter(i => i.activo);
//   }

//   crear(datos) {
//     const insumos = leerInsumos();
//     const nuevoInsumo = {
//       id: `ins_${crypto.randomBytes(4).toString('hex')}`,
//       ...datos,
//       activo: true
//     };
    
//     insumos.push(nuevoInsumo);
//     guardarInsumos(insumos);
//     return nuevoInsumo;
//   }

//   darDeBaja(id) {
//     const insumos = leerInsumos();
//     const index = insumos.findIndex(i => i.id === id);
    
//     if (index === -1) throw new Error("Insumo no encontrado");

//     // Baja lógica
//     insumos[index].activo = false;
//     guardarInsumos(insumos);
    
//     return insumos[index];
//   }
// }

// //module.exports = new InsumosService();
// export default new InsumosService();