import { FakeAppointmentRepository } from '../repositories/fakes/FakeAppointmentRepository';
import { ListProviderDailiesAvailabilityByMonthService } from './ListProviderDailiesAvailabilityByMonthService';

describe('ListProviderDailiesAvailabilityByMonthService', () => {
  let listProviderDailiesAvailabilityByMonthService: ListProviderDailiesAvailabilityByMonthService;
  let fakeAppointmentRepository: FakeAppointmentRepository;

  beforeEach(() => {
    fakeAppointmentRepository = new FakeAppointmentRepository();
    listProviderDailiesAvailabilityByMonthService =
      new ListProviderDailiesAvailabilityByMonthService(
        fakeAppointmentRepository,
      );
  });

  it.skip('should be able to list the month availability from provider when received correct data', async () => {
    await Promise.all([
      fakeAppointmentRepository.create({
        providerId: 'user',
        date: new Date(2020, 4, 20, 8, 0, 0),
        userId: '1234',
      }),
      fakeAppointmentRepository.create({
        providerId: 'user',
        date: new Date(2020, 4, 20, 9, 0, 0),
        userId: '1234',
      }),
      fakeAppointmentRepository.create({
        providerId: 'user',
        date: new Date(2020, 4, 20, 10, 0, 0),
        userId: '1234',
      }),
      fakeAppointmentRepository.create({
        providerId: 'user',
        date: new Date(2020, 4, 20, 11, 0, 0),
        userId: '1234',
      }),
      fakeAppointmentRepository.create({
        providerId: 'user',
        date: new Date(2020, 4, 20, 12, 0, 0),
        userId: '1234',
      }),
      fakeAppointmentRepository.create({
        providerId: 'user',
        date: new Date(2020, 4, 20, 13, 0, 0),
        userId: '1234',
      }),
      fakeAppointmentRepository.create({
        providerId: 'user',
        date: new Date(2020, 4, 20, 14, 0, 0),
        userId: '1234',
      }),
      fakeAppointmentRepository.create({
        providerId: 'user',
        date: new Date(2020, 4, 20, 15, 0, 0),
        userId: '1234',
      }),
      fakeAppointmentRepository.create({
        providerId: 'user',
        date: new Date(2020, 4, 20, 16, 0, 0),
        userId: '1234',
      }),
      fakeAppointmentRepository.create({
        providerId: 'user',
        date: new Date(2020, 4, 20, 17, 0, 0),
        userId: '1234',
      }),
      fakeAppointmentRepository.create({
        providerId: 'user',
        date: new Date(2020, 4, 21, 8, 0, 0),
        userId: '1234',
      }),
    ]);

    const availabilityDaysInMonth =
      await listProviderDailiesAvailabilityByMonthService.execute({
        providerId: 'user',
        year: 2020,
        month: 5,
      });

    expect(availabilityDaysInMonth).toEqual(
      expect.arrayContaining([
        { day: 19, available: true },
        { day: 20, available: false },
        { day: 21, available: true },
        { day: 22, available: true },
      ]),
    );
  });
});
