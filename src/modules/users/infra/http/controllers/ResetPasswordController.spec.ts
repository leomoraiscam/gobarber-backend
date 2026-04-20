/* eslint-disable import/newline-after-import */
/* eslint-disable import/no-extraneous-dependencies */
import request from 'supertest';
import { app } from '@shared/infra/http/app';

import { container } from 'tsyringe';
import { FakeMailProvider } from '@shared/container/providers/MailProvider/fakes/FakeMailProvider';

describe('Reset Password Controller', () => {
  it('should be able to reset the password', async () => {
    const mailProvider = container.resolve<FakeMailProvider>('MailProvider');
    const sendMailSpy = jest.spyOn(mailProvider, 'sendMail');

    await request(app).post('/users').send({
      name: 'Reset User',
      email: 'reset@example.com',
      password: 'OldPass@123',
    });

    await request(app).post('/password/forgot').send({
      email: 'reset@example.com',
    });

    const sendMailCall = sendMailSpy.mock.calls[0][0];
    const { link } = sendMailCall.templateData.variables;
    const token = (link as string).split('=')[1];

    const response = await request(app)
      .post('/password/reset')
      .query({ token })
      .send({
        password: 'NewPass@123',
      });

    expect(response.status).toBe(204);

    // Verify password changed by trying to login
    const loginResponse = await request(app).post('/auth/sessions').send({
      email: 'reset@example.com',
      password: 'NewPass@123',
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty('token');
  });

  it('should not be able to reset the password with a non-existing token', async () => {
    const response = await request(app)
      .post('/password/reset')
      .query({ token: 'db50de85-dfba-4bd4-9ae3-2a14e9f73c4d' }) // non-existing UUID
      .send({
        password: 'NewPass@123',
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid or expired token');
  });
});
