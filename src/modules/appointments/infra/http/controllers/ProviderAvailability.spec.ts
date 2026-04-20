import request from 'supertest';
import { app } from '@shared/infra/http/app';
import { container } from 'tsyringe';
import { IDateProvider } from '@shared/container/providers/DateProvider/models/IDateProvider';

describe('Provider Availability', () => {
  let userToken: string;
  let providerId: string;
  let dateProvider: IDateProvider;

  beforeAll(async () => {
    dateProvider = container.resolve<IDateProvider>('DateProvider');

    const providerResponse = await request(app).post('/users').send({
      name: 'Provider Availability',
      email: 'provider_avail@example.com',
      password: 'Pass@word123',
    });

    providerId = providerResponse.body.id;

    await request(app).post('/users').send({
      name: 'Client User',
      email: 'client_avail@example.com',
      password: 'Pass@word123',
    });

    const response = await request(app).post('/auth/sessions').send({
      email: 'client_avail@example.com',
      password: 'Pass@word123',
    });

    userToken = response.body.token;
  });

  it('should be able to list day availability for a provider', async () => {
    // Current date + 1 day
    const tomorrow = dateProvider.dateNow();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const day = tomorrow.getDate();
    const month = tomorrow.getMonth() + 1;
    const year = tomorrow.getFullYear();

    // Schedule 8:00 and 10:00
    const date8 = new Date(year, month - 1, day, 8, 0, 0);
    const date10 = new Date(year, month - 1, day, 10, 0, 0);

    await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ providerId, date: date8 });

    await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ providerId, date: date10 });

    const response = await request(app)
      .get(`/providers/${providerId}/day-availability`)
      .set('Authorization', `Bearer ${userToken}`)
      .query({ day, month, year });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        { hour: 8, available: false },
        { hour: 9, available: true },
        { hour: 10, available: false },
        { hour: 11, available: true },
      ]),
    );
  });

  it('should be able to list month availability for a provider', async () => {
    // Future month to avoid past date issues
    const futureDate = dateProvider.dateNow();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const month = futureDate.getMonth() + 1;
    const year = futureDate.getFullYear();

    // Fill all slots (8h-17h = 10 slots) for day 15
    const appointments = [];
    for (let hour = 8; hour <= 17; hour++) {
      appointments.push(
        request(app)
          .post('/appointments')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            providerId,
            date: new Date(year, month - 1, 15, hour, 0, 0),
          }),
      );
    }
    await Promise.all(appointments);

    const response = await request(app)
      .get(`/providers/${providerId}/month-availability`)
      .set('Authorization', `Bearer ${userToken}`)
      .query({ month, year });

    expect(response.status).toBe(200);
    expect(response.body).toContainEqual({ day: 15, available: false });
    expect(response.body).toContainEqual({ day: 16, available: true });
  });
});
