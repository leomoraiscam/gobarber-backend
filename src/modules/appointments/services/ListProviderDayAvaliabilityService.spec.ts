import AppError from '@shared/errors/AppError';
import FakeAppointmentsRepository from '../repositories/fakes/FakeAppointmentsRepository';
// import ListProviderMonthAvaliabilityService from './ListProviderMonthAvaliabilityService';
import ListProviderDayhAvaliabilityService from './ListProviderDayAvaliabilityService';

let listProviderDayAvaliability: ListProviderDayhAvaliabilityService;
let fakeAppointmentsRepository: FakeAppointmentsRepository;

describe('ListProvidersMonthAvaliability', () => {
  beforeEach(() => {
    fakeAppointmentsRepository = new FakeAppointmentsRepository();
    listProviderDayAvaliability = new ListProviderDayhAvaliabilityService(
      fakeAppointmentsRepository,
    );
  });

  it('should be able to list the moth avaliability from provider', async () => {
    await fakeAppointmentsRepository.create({
      provider_id: 'user',
      date: new Date(2020, 4, 20, 8, 0, 0),
    });

    await fakeAppointmentsRepository.create({
      provider_id: 'user',
      date: new Date(2020, 4, 20, 10, 0, 0),
    });

    const avaliability = await listProviderDayAvaliability.execute({
      provider_id: 'user',
      year: 2020,
      month: 5,
      day: 20,
    });

    expect(avaliability).toEqual(
      expect.arrayContaining([
        { hour: 8, availiable: false },
        { hour: 9, availiable: true },
        { hour: 10, availiable: false },
        { hour: 11, availiable: true },
      ]),
    );
  });
});
