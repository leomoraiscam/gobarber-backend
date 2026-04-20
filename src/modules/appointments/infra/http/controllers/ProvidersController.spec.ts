import request from 'supertest';
import { app } from '@shared/infra/http/app';

describe('Providers Controller', () => {
  let token: string;
  let providerId: string;

  beforeAll(async () => {
    await request(app).post('/users').send({
      name: 'Client User',
      email: 'client@example.com',
      password: 'Pass@word123',
    });

    const providerResponse = await request(app).post('/users').send({
      name: 'Provider User',
      email: 'provider@example.com',
      password: 'Pass@word123',
    });

    providerId = providerResponse.body.id;

    const response = await request(app).post('/auth/sessions').send({
      email: 'client@example.com',
      password: 'Pass@word123',
    });

    token = response.body.token;
  });

  it('should be able to list providers', async () => {
    const response = await request(app)
      .get('/providers')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toHaveProperty('name', 'Provider User');
  });

  it('should be able to list provider month availability', async () => {
    const response = await request(app)
      .get(`/providers/${providerId}/month-availability`)
      .set('Authorization', `Bearer ${token}`)
      .query({ month: 5, year: 2025 });

    expect(response.status).toBe(200);
  });

  it('should be able to list provider day availability', async () => {
    const response = await request(app)
      .get(`/providers/${providerId}/day-availability`)
      .set('Authorization', `Bearer ${token}`)
      .query({ day: 20, month: 5, year: 2025 });

    expect(response.status).toBe(200);
  });
});
