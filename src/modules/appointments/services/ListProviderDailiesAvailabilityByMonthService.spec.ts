import { FakeAppointmentRepository } from '../repositories/fakes/FakeAppointmentRepository';
import { ListProviderDailiesAvailabilityByMonthService } from './ListProviderDailiesAvailabilityByMonthService';

describe('ListProviderDailiesAvailabilityByMonthService', () => {
  let listProviderDailiesAvailabilityByMonthService: ListProviderDailiesAvailabilityByMonthService;
  let fakeAppointmentRepository: FakeAppointmentRepository;
  const OriginalDate = Date;

  beforeEach(() => {
    fakeAppointmentRepository = new FakeAppointmentRepository();
    listProviderDailiesAvailabilityByMonthService =
      new ListProviderDailiesAvailabilityByMonthService(
        fakeAppointmentRepository,
      );
    global.Date = jest.fn((...args: unknown[]) => {
      if (args.length === 0) {
        return new OriginalDate(2020, 4, 20, 11, 0, 0);
      }

      return Reflect.construct(OriginalDate, args);
    }) as unknown as DateConstructor;

    global.Date.now = OriginalDate.now;
    global.Date.parse = OriginalDate.parse;
    global.Date.UTC = OriginalDate.UTC;
  });

  it('should be able to list the month availability from provider when received correct data', async () => {
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
        { available: false, day: 1 },
        { available: false, day: 2 },
        { available: false, day: 3 },
        { available: false, day: 4 },
        { available: false, day: 5 },
        { available: false, day: 6 },
        { available: false, day: 7 },
        { available: false, day: 8 },
        { available: false, day: 9 },
        { available: false, day: 10 },
        { available: false, day: 11 },
        { available: false, day: 12 },
        { available: false, day: 13 },
        { available: false, day: 14 },
        { available: false, day: 15 },
        { available: false, day: 16 },
        { available: false, day: 17 },
        { available: false, day: 18 },
        { available: false, day: 19 },
        { available: false, day: 20 },
        { available: true, day: 21 },
        { available: true, day: 22 },
        { available: true, day: 23 },
        { available: true, day: 24 },
        { available: true, day: 25 },
        { available: true, day: 26 },
        { available: true, day: 27 },
        { available: true, day: 28 },
        { available: true, day: 29 },
        { available: true, day: 30 },
        { available: true, day: 31 },
      ]),
    );
  });
});
