import request from 'supertest';
import { app } from '@shared/infra/http/app';

describe('Create User Validation', () => {
  it('should not be able to create a user with a name shorter than 3 characters', async () => {
    const response = await request(app).post('/users').send({
      name: 'Jo',
      email: 'johndoe@example.com',
      password: 'Pass@word123',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('celebrate request validation failed');
    expect(response.body.validation.body.message).toContain(
      '"name" length must be at least 3 characters long',
    );
  });

  it('should not be able to create a user with a name containing numbers', async () => {
    const response = await request(app).post('/users').send({
      name: 'John Doe 2',
      email: 'johndoe@example.com',
      password: 'Pass@word123',
    });

    expect(response.status).toBe(400);
    expect(response.body.validation.body.message).toContain(
      'The name must contain only letters and spaces.',
    );
  });

  it('should not be able to create a user with an invalid email', async () => {
    const response = await request(app).post('/users').send({
      name: 'John Doe',
      email: 'invalid-email',
      password: 'Pass@word123',
    });

    expect(response.status).toBe(400);
    expect(response.body.validation.body.message).toContain(
      '"email" must be a valid email',
    );
  });

  it('should not be able to create a user with a password shorter than 6 characters', async () => {
    const response = await request(app).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'P@s1',
    });

    expect(response.status).toBe(400);
    expect(response.body.validation.body.message).toContain(
      '"password" length must be at least 6 characters long',
    );
  });

  it('should not be able to create a user with a password longer than 14 characters', async () => {
    const response = await request(app).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'VeryLongPassword@123',
    });

    expect(response.status).toBe(400);
    expect(response.body.validation.body.message).toContain(
      '"password" length must be less than or equal to 14 characters long',
    );
  });

  it('should not be able to create a user with a password without a number', async () => {
    const response = await request(app).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'Password@',
    });

    expect(response.status).toBe(400);
    expect(response.body.validation.body.message).toContain(
      'The password must contain at least one number and one special character.',
    );
  });

  it('should not be able to create a user with a password without a special character', async () => {
    const response = await request(app).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'Password123',
    });

    expect(response.status).toBe(400);
    expect(response.body.validation.body.message).toContain(
      'The password must contain at least one number and one special character.',
    );
  });

  it('should not be able to create a user with missing fields', async () => {
    const response = await request(app).post('/users').send({});

    expect(response.status).toBe(400);
    expect(response.body.validation.body.message).toContain(
      '"name" is required',
    );
  });
});
