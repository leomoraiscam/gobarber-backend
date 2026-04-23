import { AppError } from '@shared/errors/AppError';
import { FakeNotificationRepository } from '@modules/notifications/repositories/fakes/FakeNotificationRepository';
import { FakeCacheProvider } from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import { FakeDateProvider } from '@shared/container/providers/DateProvider/fakes/FakeDateProvider';
import { FakeUserRepository } from '@modules/users/repositories/fakes/FakeUserRepository';
import { FakeAppointmentRepository } from '../repositories/fakes/FakeAppointmentRepository';
import { CreateAppointmentService } from './CreateAppointmentService';

describe('CreateAppointmentService', () => {
  let fakeAppointmentRepository: FakeAppointmentRepository;
  let fakeNotificationsRepository: FakeNotificationRepository;
  let fakeCacheProvider: FakeCacheProvider;
  let fakeDateProvider: FakeDateProvider;
  let fakeUserRepository: FakeUserRepository;
  let createAppointmentService: CreateAppointmentService;

  beforeEach(() => {
    fakeAppointmentRepository = new FakeAppointmentRepository();
    fakeNotificationsRepository = new FakeNotificationRepository();
    fakeCacheProvider = new FakeCacheProvider();
    fakeDateProvider = new FakeDateProvider();
    fakeUserRepository = new FakeUserRepository();
    createAppointmentService = new CreateAppointmentService(
      fakeAppointmentRepository,
      fakeNotificationsRepository,
      fakeUserRepository,
      fakeCacheProvider,
      fakeDateProvider,
    );

    jest.spyOn(fakeUserRepository, 'findById').mockResolvedValue({} as any);
  });

  it('should be able to create an appointment when received correct data', async () => {
    jest.spyOn(fakeDateProvider, 'dateNow').mockImplementationOnce(() => {
      return new Date(2020, 4, 10, 12);
    });

    const appointment = await createAppointmentService.execute({
      date: new Date(2020, 4, 10, 13),
      providerId: 'faked-provider,',
      userId: 'faked-user',
    });

    expect(appointment).toHaveProperty('id');
  });

  it('should not be able to create an appointment when another one is already registered at the same time', async () => {
    jest.spyOn(fakeDateProvider, 'dateNow').mockImplementationOnce(() => {
      return new Date(2020, 4, 10, 10);
    });

    await createAppointmentService.execute({
      date: new Date(2020, 4, 10, 11),
      providerId: 'faked-provider,',
      userId: 'faked-user',
    });

    await expect(
      createAppointmentService.execute({
        date: new Date(2020, 4, 10, 11),
        providerId: 'any-provider,',
        userId: 'faked-user',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create an appointment when the same is in the past date', async () => {
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

  it('should not be able to create an appointment when hour is before 8am', async () => {
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
  });

  it('should not be able to create an appointment when hour is after 5pm', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 4, 10, 12).getTime();
    });

    await expect(
      createAppointmentService.execute({
        date: new Date(2020, 4, 11, 18),
        userId: 'faked-user',
        providerId: 'faked-provider',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
