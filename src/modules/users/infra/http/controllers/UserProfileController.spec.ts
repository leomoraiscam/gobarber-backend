import request from 'supertest';
import { app } from '@shared/infra/http/app';

describe('User Profile Controller', () => {
  let token: string;

  beforeAll(async () => {
    await request(app).post('/users').send({
      name: 'Profile User',
      email: 'profile@example.com',
      password: 'Pass@word123',
    });

    const response = await request(app).post('/auth/sessions').send({
      email: 'profile@example.com',
      password: 'Pass@word123',
    });

    token = response.body.token;
  });

  it('should be able to show the profile', async () => {
    const response = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('name', 'Profile User');
    expect(response.body).toHaveProperty('email', 'profile@example.com');
  });

  it('should be able to update the profile', async () => {
    const response = await request(app)
      .put('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Name',
        email: 'updated@example.com',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('name', 'Updated Name');
    expect(response.body).toHaveProperty('email', 'updated@example.com');
  });

  it('should be able to update the password', async () => {
    const response = await request(app)
      .put('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Name',
        email: 'updated@example.com',
        oldPassword: 'Pass@word123',
        password: 'NewPass@123',
        passwordConfirmation: 'NewPass@123',
      });

    expect(response.status).toBe(200);

    // Verify new password works
    const loginResponse = await request(app).post('/auth/sessions').send({
      email: 'updated@example.com',
      password: 'NewPass@123',
    });

    expect(loginResponse.status).toBe(200);
  });

  it('should not be able to update password with invalid old password', async () => {
    const response = await request(app)
      .put('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Name',
        email: 'updated@example.com',
        oldPassword: 'wrong_password',
        password: 'NewPass@123',
        passwordConfirmation: 'NewPass@123',
      });

    expect(response.status).toBe(422);
    expect(response.body.message).toBe('Invalid old password');
  });
});
