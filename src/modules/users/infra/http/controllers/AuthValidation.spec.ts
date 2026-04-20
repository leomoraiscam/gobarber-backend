import request from 'supertest';
import { app } from '@shared/infra/http/app';

describe('Auth Validation', () => {
  it('should not be able to authenticate with invalid email format', async () => {
    const response = await request(app).post('/auth/sessions').send({
      email: 'invalid-email',
      password: 'any-password',
    });

    expect(response.status).toBe(400);
    expect(response.body.validation.body.message).toContain(
      '"email" must be a valid email',
    );
  });

  it('should not be able to request password recovery with invalid email', async () => {
    const response = await request(app).post('/password/forgot').send({
      email: 'invalid-email',
    });

    expect(response.status).toBe(400);
    expect(response.body.validation.body.message).toContain(
      '"email" must be a valid email',
    );
  });

  it('should fail celebrate validation on password reset for invalid password pattern', async () => {
    const response = await request(app)
      .post('/password/reset?token=db50de85-dfba-4bd4-9ae3-2a14e9f73c4d')
      .send({
        password: 'weakpassword',
      });

    expect(response.status).toBe(400);
    expect(response.body.validation.body.message).toContain(
      'The password must contain at least one number and one special character.',
    );
  });
});
