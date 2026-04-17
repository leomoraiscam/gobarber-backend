import { FakeDateProvider } from '@shared/container/providers/DateProvider/fakes/FakeDateProvider';
import { FakeAppointmentRepository } from '../repositories/fakes/FakeAppointmentRepository';
import { ListProviderAvailabilityHoursByDailyService } from './ListProviderAvailabilityHoursByDailyService';

describe('ListProviderAvailabilityHoursByDailyService', () => {
  let fakeAppointmentRepository: FakeAppointmentRepository;
  let fakeDateProvider: FakeDateProvider;
  let listProviderAvailabilityHoursByDailyService: ListProviderAvailabilityHoursByDailyService;
  // const OriginalDate = Date;

  beforeEach(() => {
    fakeAppointmentRepository = new FakeAppointmentRepository();
    fakeDateProvider = new FakeDateProvider();
    listProviderAvailabilityHoursByDailyService =
      new ListProviderAvailabilityHoursByDailyService(
        fakeAppointmentRepository,
        fakeDateProvider,
      );

    // global.Date = jest.fn((...args: unknown[]) => {
    //   if (args.length === 0) {
    //     return new OriginalDate(2020, 4, 20, 11, 0, 0);
    //   }

    //   return Reflect.construct(OriginalDate, args);
    // }) as unknown as DateConstructor;

    // global.Date.now = OriginalDate.now;
    // global.Date.parse = OriginalDate.parse;
    // global.Date.UTC = OriginalDate.UTC;
  });

  // afterEach(() => {
  //   jest.restoreAllMocks();
  // });

  it('should be able to list the hours available from provider by day when received correct data', async () => {
    // jest.spyOn(fakeDateProvider, 'dateNow').mockImplementationOnce(() => {
    //   return new Date(2020, 4, 20, 11);
    // });

    jest
      .spyOn(fakeDateProvider, 'dateNow')
      .mockReturnValue(new Date(2020, 4, 20, 11));

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
      await listProviderAvailabilityHoursByDailyService.execute({
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
