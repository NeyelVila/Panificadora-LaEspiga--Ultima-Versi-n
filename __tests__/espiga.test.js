/**
 * Pruebas automatizadas — La Espiga de Oro
 * Jest + Supertest: verifican endpoints críticos sin depender de clics manuales.
 */
import { jest, describe, test, expect, beforeAll } from '@jest/globals';

// Evita que los tests requieran MongoDB al importar la app
jest.unstable_mockModule('../src/config/db.js', () => ({
  conectarDB: jest.fn(async () => undefined),
}));

let request;
let app;

beforeAll(async () => {
  const supertest = await import('supertest');
  request = supertest.default;
  const appModule = await import('../app.js');
  app = appModule.default;
});

describe('Seguridad — rutas protegidas sin sesión', () => {
  test('GET / (dashboard) sin login → redirige al login (302)', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/auth/login');
  });

  test('GET /clientes sin login → redirige al login (302)', async () => {
    const res = await request(app).get('/clientes');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/auth/login');
  });

  test('GET /pedidos (API) sin login → redirige al login (302)', async () => {
    const res = await request(app).get('/pedidos');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/auth/login');
  });
});

describe('Autenticación — rutas públicas', () => {
  test('GET /auth/login → 200 (formulario de acceso disponible)', async () => {
    const res = await request(app).get('/auth/login');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/login|sesión|Iniciar/i);
  });
});

describe('404 — Ruta no encontrada', () => {
  test('GET /ruta-que-no-existe → 404 con mensaje JSON', async () => {
    const res = await request(app).get('/ruta-que-no-existe');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Ruta no encontrada' });
  });
});
