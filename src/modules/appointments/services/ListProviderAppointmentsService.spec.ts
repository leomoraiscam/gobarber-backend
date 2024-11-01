import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import { FakeAppointmentRepository } from '../repositories/fakes/FakeAppointmentRepository';
import ListProviderAppointmentService from './ListProviderAppointmentsService';

describe('ListProviderAppointmentsService', () => {
  let fakeAppointmentRepository: FakeAppointmentRepository;
  let fakeCacheProvider: FakeCacheProvider;
  let listProviderAppointment: ListProviderAppointmentService;

  beforeEach(() => {
    fakeAppointmentRepository = new FakeAppointmentRepository();
    fakeCacheProvider = new FakeCacheProvider();
    listProviderAppointment = new ListProviderAppointmentService(
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

    const appointments = await listProviderAppointment.execute({
      providerId: 'faked-provider',
      year: 2020,
      month: 5,
      day: 20,
    });

    expect(appointments).toEqual([firstAppointment, secondAppointment]);
  });
});
