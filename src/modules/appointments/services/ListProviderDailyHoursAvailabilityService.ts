import { injectable, inject } from 'tsyringe';
import { IDateProvider } from '@shared/container/providers/DateProvider/models/IDateProvider';
import { IAppointmentRepository } from '../repositories/IAppointmentRepository';
import { ListProviderAvailableHoursResponse } from '../dtos/ListProviderAvailableHoursDTO';
import { IFindDailyAppointmentsByProviderDTO } from '../dtos/IFindDailyAppointmentsByProviderDTO';

@injectable()
export class ListProviderDailyHoursAvailabilityService {
  private APPOINTMENTS_SIZE = 10;
  private APPOINTMENTS_START_HOURS = 8;
  private OFF_SET_MONTHS = 1;

  constructor(
    @inject('AppointmentRepository')
    private appointmentRepository: IAppointmentRepository,
    @inject('DateProvider')
    private dateProvider: IDateProvider,
  ) {}

  async execute(
    data: IFindDailyAppointmentsByProviderDTO,
  ): Promise<ListProviderAvailableHoursResponse> {
    const { providerId, month, year, day } = data;
    const appointments =
      await this.appointmentRepository.findAllDailyByProvider({
        providerId,
        month,
        year,
        day,
      });
    const eachHour = Array.from(
      {
        length: this.APPOINTMENTS_SIZE,
      },
      (_, index) => index + this.APPOINTMENTS_START_HOURS,
    );
    const currentDate = new Date(Date.now());

    return eachHour.map(hour => {
      const hasAppointmentInHour = appointments.find(appointment => {
        const getHourInDate = this.dateProvider.getHours(appointment.date);

        return getHourInDate === hour;
      });
      const appointmentDate = new Date(
        year,
        month - this.OFF_SET_MONTHS,
        day,
        hour,
      );
      const isBefore = this.dateProvider.compareIfBefore(
        appointmentDate,
        currentDate,
      );

      return {
        hour,
        available: !hasAppointmentInHour && !isBefore,
      };
    });
  }
}
