function logger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.url} → ${res.statusCode} (${duration}ms)`
    );
  });

  next();
}

// commons js module export
// module.exports = logger;
// ECMAScript Modules 
export default logger;