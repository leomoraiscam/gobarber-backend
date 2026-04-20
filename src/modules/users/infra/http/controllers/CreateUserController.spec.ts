/* eslint-disable import/newline-after-import */
/* eslint-disable import/no-extraneous-dependencies */
import request from 'supertest';
import { app } from '@shared/infra/http/app';
describe('Create User Controller', () => {
  it('should be able to create a new user', async () => {
    const response = await request(app).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'Pass@word123',
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name', 'John Doe');
    expect(response.body).toHaveProperty('email', 'johndoe@example.com');
    // Check that password is not returned
    expect(response.body).not.toHaveProperty('password');
  });

  it('should not be able to create a user with an already used email', async () => {
    // Create first user
    await request(app).post('/users').send({
      name: 'John Doe Two',
      email: 'johndoe2@example.com',
      password: 'Pass@word123',
    });

    // Try to create another user with same email
    const response = await request(app).post('/users').send({
      name: 'John Doe Three',
      email: 'johndoe2@example.com',
      password: 'Pass@word123',
    });

    expect(response.status).toBe(409);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('User already exists');
  });
});
