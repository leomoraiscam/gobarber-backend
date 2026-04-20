// @ts-ignore
import request from 'supertest';
import { app } from '@shared/infra/http/app';
import createConnection from '@shared/infra/typeorm';

describe('Session Controller', () => {
  beforeAll(async () => {
    await createConnection();

    await request(app).post('/users').send({
      name: 'Login User',
      email: 'login@example.com',
      password: 'Pass@word123',
    });
  });

  it('should be able to authenticate', async () => {
    const response = await request(app).post('/auth/sessions').send({
      email: 'login@example.com',
      password: 'Pass@word123',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user).not.toHaveProperty('password');
  });

  it('should not be able to authenticate with wrong password', async () => {
    const response = await request(app).post('/auth/sessions').send({
      email: 'login@example.com',
      password: 'wrong_password_123!',
    });

    // Gobarber default handles authentication failures with 401
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Incorrect email/password combination');
  });

  it('should not be able to authenticate with non-existing user', async () => {
    const response = await request(app).post('/auth/sessions').send({
      email: 'nobody@example.com',
      password: 'wrong_password_123!',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Incorrect email/password combination');
  });
});
