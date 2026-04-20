import request from 'supertest';
import { app } from '@shared/infra/http/app';
import path from 'path';
import fs from 'fs';

describe('User Avatar Controller', () => {
  let token: string;

  beforeAll(async () => {
    await request(app).post('/users').send({
      name: 'Avatar User',
      email: 'avatar@example.com',
      password: 'Pass@word123',
    });

    const response = await request(app).post('/auth/sessions').send({
      email: 'avatar@example.com',
      password: 'Pass@word123',
    });

    token = response.body.token;
  });

  it('should be able to update user avatar', async () => {
    const dummyFilePath = path.resolve(__dirname, 'avatar.png');
    fs.writeFileSync(dummyFilePath, 'dummy content');

    const response = await request(app)
      .patch('/users/me/avatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('avatar', dummyFilePath);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('avatar');
    expect(response.body.avatar).toMatch(/\.png$/);

    fs.unlinkSync(dummyFilePath);
  });

  it('should not be able to update avatar without being authenticated', async () => {
    const response = await request(app).patch('/users/me/avatar');

    expect(response.status).toBe(401);
  });
});
