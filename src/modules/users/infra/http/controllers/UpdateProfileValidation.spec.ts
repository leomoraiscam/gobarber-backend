/* eslint-disable import/newline-after-import */
/* eslint-disable import/no-extraneous-dependencies */
import request from 'supertest';
import { app } from '@shared/infra/http/app';
import createConnection from '@shared/infra/typeorm';

describe('Update Profile Validation', () => {
  let token: string;

  beforeAll(async () => {
    await createConnection();

    await request(app).post('/users').send({
      name: 'Validation User',
      email: 'validation@example.com',
      password: 'Pass@word123',
    });

    const response = await request(app).post('/auth/sessions').send({
      email: 'validation@example.com',
      password: 'Pass@word123',
    });

    token = response.body.token;
  });

  it('should not be able to update profile with invalid email format', async () => {
    const response = await request(app)
      .put('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'invalid-email',
      });

    expect(response.status).toBe(400);
    expect(response.body.validation.body.message).toContain(
      '"email" must be a valid email',
    );
  });

  it('should not be able to update password without informing the old password', async () => {
    const response = await request(app)
      .put('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        password: 'New@Password123',
        passwordConfirmation: 'New@Password123',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('celebrate request validation failed');
  });

  it('should not be able to update password without informing the password confirmation', async () => {
    const response = await request(app)
      .put('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        password: 'New@Password123',
        oldPassword: 'Pass@word123',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('celebrate request validation failed');
  });

  it('should not be able to update password if confirmation does not match', async () => {
    const response = await request(app)
      .put('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        password: 'New@Password123',
        passwordConfirmation: 'Different@123',
        oldPassword: 'Pass@word123',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('celebrate request validation failed');
  });

  it('should not be able to update password with incorrect old password', async () => {
    const response = await request(app)
      .put('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        password: 'New@Password123',
        passwordConfirmation: 'New@Password123',
        oldPassword: 'wrong-password',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('celebrate request validation failed');
  });

  it('should fail celebrate validation for invalid name pattern', async () => {
    const response = await request(app)
      .put('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'John123',
      });

    expect(response.status).toBe(400);
    expect(response.body.validation.body.message).toContain(
      'The name must contain only letters and spaces.',
    );
  });
});
