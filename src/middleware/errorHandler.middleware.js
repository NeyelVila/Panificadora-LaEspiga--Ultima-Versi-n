// Middleware global para manejo de errores
export const errorHandler = (err, req, res, next) => {
  // 1. Registramos el error en la consola del servidor (ideal para que lo veas tú)
  console.error(`🔴 ERROR [${req.method} ${req.url}]:`, err.message);
  
  // 2. Definimos el código de estado (500 por defecto si no viene uno específico)
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
  // Como estás usando Pug, lo ideal sería renderizar una vista de error. 
  // Si no tienes una, podemos enviar un mensaje simple de texto por ahora.
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
