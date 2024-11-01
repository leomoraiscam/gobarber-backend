import { FakeAppointmentRepository } from '../repositories/fakes/FakeAppointmentRepository';
import { ListProviderDailyHoursAvailabilityService } from './ListProviderDailyHoursAvailabilityService';

describe('ListProviderDailyHoursAvailabilityService', () => {
  let fakeAppointmentRepository: FakeAppointmentRepository;
  let listProviderDailyHoursAvailabilityService: ListProviderDailyHoursAvailabilityService;

  beforeEach(() => {
    fakeAppointmentRepository = new FakeAppointmentRepository();
    listProviderDailyHoursAvailabilityService =
      new ListProviderDailyHoursAvailabilityService(fakeAppointmentRepository);
  });

  it('should be able to list the hours available from provider by day when received correct data', async () => {
    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      return new Date(2020, 4, 20, 11).getTime();
    });

    await Promise.all([
      fakeAppointmentRepository.create({
        providerId: 'user',
        userId: '1234',
        date: new Date(2020, 4, 20, 14, 0, 0),
      }),
      fakeAppointmentRepository.create({
        providerId: 'user',
        userId: '1234',
        date: new Date(2020, 4, 20, 15, 0, 0),
      }),
    ]);

    const availableHours =
      await listProviderDailyHoursAvailabilityService.execute({
        providerId: 'user',
        year: 2020,
        month: 5,
        day: 20,
      });

    expect(availableHours).toEqual(
      expect.arrayContaining([
        { hour: 8, available: false },
        { hour: 9, available: false },
        { hour: 10, available: false },
        { hour: 11, available: false },
        { hour: 12, available: true },
        { hour: 13, available: true },
        { hour: 14, available: false },
        { hour: 15, available: false },
        { hour: 16, available: true },
        { hour: 17, available: true },
      ]),
    );
  });
});
