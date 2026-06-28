/**
 * Tests con sesión simulada — La Espiga de Oro
 *
 * Supertest "agent" mantiene la cookie de sesión entre peticiones,
 * igual que un navegador después del login.
 */
import { jest, describe, test, expect, beforeAll } from '@jest/globals';

const usuarioFake = {
  _id: '507f1f77bcf86cd799439011',
  nombre: 'Usuario Test',
  email: 'test@espiga.com',
  password: 'hash_simulado',
  rol: 'admin',
};

jest.unstable_mockModule('../src/config/db.js', () => ({
  conectarDB: jest.fn(async () => undefined),
}));

jest.unstable_mockModule('../src/models/Usuario.js', () => ({
  default: {
    findOne: jest.fn(async () => usuarioFake),
  },
}));

jest.unstable_mockModule('bcrypt', () => ({
  default: {
    compare: jest.fn(async () => true),
    genSalt: jest.fn(),
    hash: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/clientes.schema.js', () => ({
  default: {
    countDocuments: jest.fn(async () => 12),
  },
}));

jest.unstable_mockModule('../src/models/Pedido.js', () => ({
  default: {
    countDocuments: jest.fn(async () => 8),
  },
}));

jest.unstable_mockModule('../src/models/Insumo.js', () => ({
  default: {
    find: jest.fn(async () => [
      { stockActual: 2, stockMinimo: 5 },
      { stockActual: 10, stockMinimo: 3 },
    ]),
  },
}));

let request;
let app;

beforeAll(async () => {
  const supertest = await import('supertest');
  request = supertest.default;
  const appModule = await import('../app.js');
  app = appModule.default;
});

describe('Sesión simulada — flujo login + dashboard', () => {
  test('POST /auth/login → redirige a productos y guarda sesión', async () => {
    const agent = request.agent(app);

    const login = await agent
      .post('/auth/login')
      .send({ email: 'test@espiga.com', password: 'miPassword123' });

    expect(login.statusCode).toBe(302);
    expect(login.headers.location).toBe('/productos/view');
  });

  test('Con sesión activa, GET / (dashboard) → 200 HTML', async () => {
    const agent = request.agent(app);

    await agent
      .post('/auth/login')
      .send({ email: 'test@espiga.com', password: 'miPassword123' });

    const dash = await agent.get('/');
    expect(dash.statusCode).toBe(200);
    expect(dash.text).toMatch(/html/i);
  });

  test('Sin agent, la cookie no se comparte → GET / sigue en 302', async () => {
    // Login con request "suelt": la cookie no se guarda para la siguiente petición
    await request(app)
      .post('/auth/login')
      .send({ email: 'test@espiga.com', password: 'miPassword123' });

    const sinSesion = await request(app).get('/');
    expect(sinSesion.statusCode).toBe(302);
    expect(sinSesion.headers.location).toBe('/auth/login');
  });
});
