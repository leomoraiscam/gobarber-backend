import request from 'supertest';
import { app } from '@shared/infra/http/app';
import { getMongoRepository } from 'typeorm';
import { Notification } from '@modules/notifications/infra/typeorm/schemas/Notification';
import { container } from 'tsyringe';
import { IDateProvider } from '@shared/container/providers/DateProvider/models/IDateProvider';

describe('Appointments Controller', () => {
  let userToken: string;
  let providerId: string;
  let dateProvider: IDateProvider;

  beforeAll(async () => {
    dateProvider = container.resolve<IDateProvider>('DateProvider');
    await request(app).post('/users').send({
      name: 'Client User',
      email: 'client_appointment@example.com',
      password: 'Pass@word123',
    });

    const providerResponse = await request(app).post('/users').send({
      name: 'Provider User',
      email: 'provider_appointment@example.com',
      password: 'Pass@word123',
    });

    providerId = providerResponse.body.id;

    const response = await request(app).post('/auth/sessions').send({
      email: 'client_appointment@example.com',
      password: 'Pass@word123',
    });

    userToken = response.body.token;
  });

  it('should be able to create a new appointment', async () => {
    // Current date + 1 day at 10:00
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(10, 0, 0, 0);

    const response = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        providerId,
        date,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.providerId).toBe(providerId);

    // Verify notification in MongoDB
    const notificationRepository = getMongoRepository(Notification, 'mongo');
    const notification = await notificationRepository.findOne({
      recipientId: providerId,
    });

    expect(notification).toBeTruthy();
    expect(notification?.content).toContain('Novo agendamento');
  });

  it('should not be able to create an appointment on a past date', async () => {
    const date = new Date(2020, 10, 10, 10, 0, 0);

    const response = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        providerId,
        date,
      });

    expect(response.status).toBe(422);
    expect(response.body.message).toBe(
      "You can't create an appointment on a past date",
    );
  });

  it('should not be able to create an appointment with yourself', async () => {
    // We need to login as the provider to try scheduling with self
    const loginResponse = await request(app).post('/auth/sessions').send({
      email: 'provider_appointment@example.com',
      password: 'Pass@word123',
    });
    const providerToken = loginResponse.body.token;

    const date = dateProvider.dateNow();
    date.setDate(date.getDate() + 1);
    date.setHours(11, 0, 0, 0);

    const response = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        providerId,
        date,
      });

    expect(response.status).toBe(422);
    expect(response.body.message).toBe(
      "You can't create an appointment with yourself",
    );
  });

  it('should not be able to create an appointment outside commercial hours', async () => {
    const date = dateProvider.dateNow();
    date.setDate(date.getDate() + 1);
    date.setHours(7, 0, 0, 0); // before 8am

    const response = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        providerId,
        date,
      });

    expect(response.status).toBe(422);
    expect(response.body.message).toBe(
      "You can't create an appointments between 8am and 5pm",
    );
  });
});
