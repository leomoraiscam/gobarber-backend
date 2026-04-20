import request from 'supertest';
import { app } from '@shared/infra/http/app';

describe('Rate Limiter', () => {
  jest.setTimeout(30000);

  it('should be able to block requests after exceeding the limit', async () => {
    // The limit is configured as 50 points per second in test environment
    const requests = [];
    for (let i = 0; i < 60; i++) {
      requests.push(request(app).get('/'));
    }

    await Promise.all(requests);

    const response = await request(app).get('/');

    expect(response.status).toBe(429);
    expect(response.body.message).toBe('Too many requests');
  });
});
