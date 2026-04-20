import request from 'supertest';
import { app } from '@shared/infra/http/app';
import { container } from 'tsyringe';
import { FakeMailProvider } from '@shared/container/providers/MailProvider/fakes/FakeMailProvider';

describe('Forgot Password Controller', () => {
  it('should be able to request a password recovery email', async () => {
    // Create a user first
    await request(app).post('/users').send({
      name: 'Forgot User',
      email: 'forgot@example.com',
      password: 'Pass@word123',
    });

    const mailProvider = container.resolve<FakeMailProvider>('MailProvider');

    const sendMail = jest.spyOn(mailProvider, 'sendMail');

    const response = await request(app).post('/password/forgot').send({
      email: 'forgot@example.com',
    });

    expect(response.status).toBe(204);
    expect(sendMail).toHaveBeenCalled();
  });

  it('should not be able to request a recovery email for a non-existing user', async () => {
    const response = await request(app).post('/password/forgot').send({
      email: 'nonexisting@example.com',
    });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});
