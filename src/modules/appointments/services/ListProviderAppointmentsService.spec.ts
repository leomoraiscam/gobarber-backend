import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import FakeAppointmentsRepository from '../repositories/fakes/FakeAppointmentsRepository';
import ListProviderAppointmentService from './ListProviderAppointmentsService';

describe('ListProviderAppointmentsService', () => {
  let fakeAppointmentsRepository: FakeAppointmentsRepository;
  let fakeCacheProvider: FakeCacheProvider;
  let listProviderAppointment: ListProviderAppointmentService;

  beforeEach(() => {
    fakeAppointmentsRepository = new FakeAppointmentsRepository();
    fakeCacheProvider = new FakeCacheProvider();
    listProviderAppointment = new ListProviderAppointmentService(
      fakeAppointmentsRepository,
      fakeCacheProvider,
    );
  });

  it.skip('should be able to list the appointments on a specific day when received correct data', async () => {
    const [firstAppointment, secondAppointment] = await Promise.all([
      fakeAppointmentsRepository.create({
        providerId: 'faked-provider',
        userId: 'faked-user',
        date: new Date(2020, 4, 20, 14, 0, 0),
      }),
      fakeAppointmentsRepository.create({
        providerId: 'faked-provider',
        userId: 'faked-user',
        date: new Date(2020, 4, 20, 15, 0, 0),
      }),
    ]);

    const appointments = await listProviderAppointment.execute({
      providerId: 'faked-provider',
      year: 2020,
      month: 5,
      day: 20,
    });

    expect(appointments).toBe([firstAppointment, secondAppointment]);
  });
});
