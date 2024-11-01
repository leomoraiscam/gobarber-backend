import AppError from '@shared/errors/AppError';
import FakeNotificationsRepository from '@modules/notifications/repositories/fakes/FakeNotificationRepository';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import { FakeAppointmentRepository } from '../repositories/fakes/FakeAppointmentRepository';
import { CreateAppointmentService } from './CreateAppointmentService';

describe('CreateAppointmentService', () => {
  let fakeAppointmentRepository: FakeAppointmentRepository;
  let fakeNotificationsRepository: FakeNotificationsRepository;
  let fakeCacheProvider: FakeCacheProvider;
  let createAppointmentService: CreateAppointmentService;

  beforeEach(() => {
    fakeAppointmentRepository = new FakeAppointmentRepository();
    fakeNotificationsRepository = new FakeNotificationsRepository();
    fakeCacheProvider = new FakeCacheProvider();
    createAppointmentService = new CreateAppointmentService(
      fakeAppointmentRepository,
      fakeNotificationsRepository,
      fakeCacheProvider,
    );
  });

  it('should be able to create an appointment when received correct data', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 4, 10, 12).getTime();
    });

    const appointment = await createAppointmentService.execute({
      date: new Date(2020, 4, 10, 13),
      providerId: 'faked-provider,',
      userId: 'faked-user',
    });

    expect(appointment).toHaveProperty('id');
  });

  it('should not be able to create an appointments when has two on the same time', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 4, 10, 10).getTime();
    });

    const appointmentDate = new Date(2020, 4, 10, 11);

    await createAppointmentService.execute({
      date: appointmentDate,
      providerId: 'faked-provider,',
      userId: 'faked-user',
    });

    await expect(
      createAppointmentService.execute({
        date: appointmentDate,
        providerId: 'any-provider,',
        userId: 'faked-user',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create an appointment when received a past date', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 4, 10, 12).getTime();
    });

    await expect(
      createAppointmentService.execute({
        date: new Date(2020, 4, 10, 11),
        userId: 'faked-user',
        providerId: 'faked-provider',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create an appointment when user same as provider', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 4, 10, 12).getTime();
    });

    await expect(
      createAppointmentService.execute({
        date: new Date(2020, 4, 10, 13),
        userId: 'faked-user',
        providerId: 'faked-user',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create an appointment when hour is before 8am and after 5pm', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 4, 10, 12).getTime();
    });

    await expect(
      createAppointmentService.execute({
        date: new Date(2020, 4, 11, 7),
        userId: 'faked-user',
        providerId: 'faked-provider',
      }),
    ).rejects.toBeInstanceOf(AppError);
    await expect(
      createAppointmentService.execute({
        date: new Date(2020, 4, 11, 18),
        userId: 'faked-user',
        providerId: 'faked-provider',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
