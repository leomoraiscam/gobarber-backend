import { injectable, inject } from 'tsyringe';
import { IDateProvider } from '@shared/container/providers/DateProvider/models/IDateProvider';
import { AppError } from '@shared/errors/AppError';
import { IUserRepository } from '@modules/users/repositories/IUserRepository';
import { IAppointmentRepository } from '../repositories/IAppointmentRepository';
import { ListProviderAvailableHoursResponse } from '../dtos/ListProviderAvailableHoursDTO';
import { IFindDailyAppointmentsByProviderDTO } from '../dtos/IFindDailyAppointmentsByProviderDTO';

@injectable()
export class ListProviderAvailabilityHoursByDailyService {
  private APPOINTMENTS_SIZE = 10;
  private APPOINTMENTS_START_HOUR = 8;
  private OFF_SET_MONTH = 1;

  constructor(
    @inject('AppointmentRepository')
    private appointmentRepository: IAppointmentRepository,
    @inject('UserRepository')
    private userRepository: IUserRepository,
    @inject('DateProvider')
    private dateProvider: IDateProvider,
  ) {}

  async execute(
    data: IFindDailyAppointmentsByProviderDTO,
  ): Promise<ListProviderAvailableHoursResponse> {
    const { providerId, month, year, day } = data;
    const existingProvider = await this.userRepository.findById(providerId);

    if (!existingProvider) {
      throw new AppError('Provider not found', 404);
    }

    const appointments =
      await this.appointmentRepository.findAllDailyByProvider({
        providerId,
        month,
        year,
        day,
      });
    const eachHours = Array.from(
      {
        length: this.APPOINTMENTS_SIZE,
      },
      (_, index) => index + this.APPOINTMENTS_START_HOUR,
    );

    return eachHours.map(hour => {
      const appointmentInHour = appointments.find(appointment => {
        const getHourInDate = this.dateProvider.getHours(appointment.date);

        return getHourInDate === hour;
      });
      const appointmentDateHour = new Date(
        year,
        month - this.OFF_SET_MONTH,
        day,
        hour,
      );
      const currentDate = this.dateProvider.dateNow();
      const isBefore = this.dateProvider.compareIfBefore(
        appointmentDateHour,
        currentDate,
      );

      return {
        hour,
        available: !appointmentInHour && !isBefore,
      };
    });
  }
}
