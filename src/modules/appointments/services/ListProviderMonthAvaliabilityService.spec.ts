import AppError from '@shared/errors/AppError';
import FakeAppointmentsRepository from '../repositories/fakes/FakeAppointmentsRepository';
import ListProviderMonthAvaliabilityService from './ListProviderMonthAvaliabilityService';

let listProviderMonthAvaliability: ListProviderMonthAvaliabilityService;
let fakeAppointmentsRepository: FakeAppointmentsRepository;

describe('ListProvidersMonthAvaliability', () => {
  beforeEach(() => {
    fakeAppointmentsRepository = new FakeAppointmentsRepository();
    listProviderMonthAvaliability = new ListProviderMonthAvaliabilityService(
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

    await fakeAppointmentsRepository.create({
      provider_id: 'user',
      date: new Date(2020, 4, 21, 8, 0, 0),
    });

    await fakeAppointmentsRepository.create({
      provider_id: 'user',
      date: new Date(2020, 4, 21, 10, 0, 0),
    });

    const avaliability = await listProviderMonthAvaliability.execute({
      provider_id: 'user',
      year: 2020,
      month: 5,
    });

    expect(avaliability).toEqual(
      expect.arrayContaining([
        { day: 19, available: false },
        { day: 20, available: false },
        { day: 21, available: false },
        { day: 22, available: false },
      ]),
    );
  });
});
