import { FakeCacheProvider } from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import { FakeAppointmentRepository } from '../repositories/fakes/FakeAppointmentRepository';
import { ListProviderAppointmentsService } from './ListProviderAppointmentsService';

describe('ListProviderAppointmentsService', () => {
  let fakeAppointmentRepository: FakeAppointmentRepository;
  let fakeCacheProvider: FakeCacheProvider;
  let listProviderAppointmentsService: ListProviderAppointmentsService;

  beforeEach(() => {
    fakeAppointmentRepository = new FakeAppointmentRepository();
    fakeCacheProvider = new FakeCacheProvider();
    listProviderAppointmentsService = new ListProviderAppointmentsService(
      fakeAppointmentRepository,
      fakeCacheProvider,
    );
  });

  it('should be able to list the appointments on a specific day when received correct data', async () => {
    const [firstAppointment, secondAppointment] = await Promise.all([
      fakeAppointmentRepository.create({
        providerId: 'faked-provider',
        userId: 'faked-user',
        date: new Date(2020, 4, 20, 14, 0, 0),
      }),
      fakeAppointmentRepository.create({
        providerId: 'faked-provider',
        userId: 'faked-user',
        date: new Date(2020, 4, 20, 15, 0, 0),
      }),
    ]);

    const appointments = await listProviderAppointmentsService.execute({
      providerId: 'faked-provider',
      year: 2020,
      month: 5,
      day: 20,
    });

    expect(appointments).toEqual([firstAppointment, secondAppointment]);
  });

  it('should be able to cache the list of appointments when occurs an first execution', async () => {
    const cacheSaveSpy = jest.spyOn(fakeCacheProvider, 'save');
    const [appointment] = await Promise.all([
      fakeAppointmentRepository.create({
        providerId: 'faked-provider',
        userId: 'faked-user',
        date: new Date(2020, 4, 20, 14, 0, 0),
      }),
    ]);

    await listProviderAppointmentsService.execute({
      providerId: 'faked-provider',
      year: 2020,
      month: 5,
      day: 20,
    });

    expect(cacheSaveSpy).toHaveBeenCalledWith(
      `provider-appointments: faked-provider:2020-5-20`,
      expect.arrayContaining([appointment]),
    );
  });

  it('should be able to retrieve appointments from cache if available when the same has persisted in cache', async () => {
    const cacheRecoverSpy = jest.spyOn(fakeCacheProvider, 'recover');
    const [appointment] = await Promise.all([
      fakeAppointmentRepository.create({
        providerId: 'faked-provider',
        userId: 'faked-user',
        date: new Date(2020, 4, 20, 14, 0, 0),
      }),
    ]);

    await fakeCacheProvider.save(
      `provider-appointments: faked-provider:2020-5-20`,
      [appointment],
    );

    const appointments = await listProviderAppointmentsService.execute({
      providerId: 'faked-provider',
      year: 2020,
      month: 5,
      day: 20,
    });

    expect(cacheRecoverSpy).toHaveBeenCalledWith(
      `provider-appointments: faked-provider:2020-5-20`,
    );
    expect(appointments).toEqual([
      { ...appointment, date: appointment.date.toISOString() },
    ]);
  });
});
