import Receta from '../models/Receta.js';
import Producto from '../models/Producto.js';
import Insumo from '../models/Insumo.js';

class RecetasService {
  async obtenerTodas() {
    return await Receta.find()
      .populate('productoId', 'nombre')
      .populate('ingredientes.insumoId', 'nombre unidad');
  }

  async crear(datos) {
    const { productoId, ingredientes } = datos;

    // 1. Validar Producto
    const producto = await Producto.findById(productoId);
    if (!producto || !producto.activo) {
      throw new Error("El producto es inválido o está inactivo.");
    }

    // 2. Validar que no exista ya una receta para este producto
    const recetaExistente = await Receta.findOne({ productoId });
    if (recetaExistente) {
      throw new Error("Este producto ya tiene una receta configurada.");
    }

    // 3. Validar Insumos
    for (const ing of ingredientes) {
      const insumo = await Insumo.findById(ing.insumoId);
      if (!insumo || !insumo.activo) {
        throw new Error(`El insumo ${ing.insumoId} no existe o está inactivo.`);
      }
      if (ing.cantidad <= 0) {
        throw new Error("La cantidad del insumo debe ser mayor a 0.");
      }
    }

    const nuevaReceta = new Receta(datos);
    return await nuevaReceta.save();
  }

  async obtenerPorProducto(productoId) {
    return await Receta.findOne({ productoId });
  }
}

export default new RecetasService();

// ##########CODIGIO ANTERIOR CON ARCHIVOS JSON (SIN BASE DE DATOS)##########
// import fs from 'fs';
// import path from 'path';
// import crypto from 'crypto';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const recetasPath = path.join(__dirname, '../data/recetas.json');
// const productosPath = path.join(__dirname, '../data/productos.json');
// const insumosPath = path.join(__dirname, '../data/insumos.json');

// const leerJson = (ruta) => {
//   if (!fs.existsSync(ruta)) fs.writeFileSync(ruta, '[]', 'utf-8');
//   return JSON.parse(fs.readFileSync(ruta, 'utf-8'));
// };

// const guardarJson = (ruta, datos) => {
//   fs.writeFileSync(ruta, JSON.stringify(datos, null, 2));
// };

// class RecetasService {
//   obtenerTodas() {
//     return leerJson(recetasPath);
//   }

//   obtenerPorProducto(productoId) {
//     const recetas = leerJson(recetasPath);
//     return recetas.find(r => r.productoId === productoId);
//   }

//   crear(datos) {
//     const { productoId, ingredientes } = datos;
//     const recetas = leerJson(recetasPath);
//     const productos = leerJson(productosPath);
//     const insumos = leerJson(insumosPath);

//     // 1. Validar que el producto existe y está activo
//     const productoValido = productos.find(p => p.id === productoId && p.activo);
//     if (!productoValido) throw new Error("Producto inválido o inactivo.");

//     // 2. Validar que no exista ya una receta para este producto
//     const recetaExistente = recetas.find(r => r.productoId === productoId);
//     if (recetaExistente) throw new Error("Este producto ya tiene una receta asignada.");

//     // 3. Validar ingredientes
//     const ingredientesValidados = ingredientes.map(ing => {
//       const insumoValido = insumos.find(i => i.id === ing.insumoId && i.activo);
//       if (!insumoValido) throw new Error(`El insumo ${ing.insumoId} no existe o está inactivo.`);
//       if (ing.cantidad <= 0) throw new Error("La cantidad del insumo debe ser mayor a 0.");
      
//       return {
//         insumoId: ing.insumoId,
//         cantidad: ing.cantidad
//       };
//     });

//     const nuevaReceta = {
//       id: `rec_${crypto.randomBytes(4).toString('hex')}`,
//       productoId,
//       ingredientes: ingredientesValidados
//     };

//     recetas.push(nuevaReceta);
//     guardarJson(recetasPath, recetas);
//     return nuevaReceta;
//   }
// }

// //module.exports = new RecetasService();
// export default new RecetasService();