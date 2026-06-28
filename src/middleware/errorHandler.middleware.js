// Middleware global para manejo de errores
export const errorHandler = (err, req, res, next) => {
  // 1. Registramos el error en la consola del servidor (ideal para que lo veas tú)
  console.error(`🔴 ERROR [${req.method} ${req.url}]:`, err.message);
  
  // 2. Definimos el código de estado (500 por defecto)
  const statusCode = err.status || 500;
  const mensaje = err.message || 'Ocurrió un error interno en el servidor';

  const wantsJson =
    req.path.startsWith('/productos') ||
    req.path.startsWith('/pedidos') ||
    req.path.includes('/eliminar') ||
    req.accepts('json') === 'json';

  if (wantsJson) {
    return res.status(statusCode).json({ error: true, mensaje });
  }

  // 3. Enviamos la respuesta al cliente
  res.status(statusCode).send(`
    <html>
      <body style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #d9534f;">¡Ups! Algo salió mal.</h1>
        <h2>Error ${statusCode}</h2>
        <p>${mensaje}</p>
        <a href="/productos/view" style="color: #007BFF;">Volver al inicio</a>
      </body>
    </html>
  `);
};
<<<<<<< HEAD
=======
  // Proxima implementación: renderizar una vista de error con EJS o Pug.
>>>>>>> 8f97924f90d63604ec7cbebbf41436db7df6fcfa
