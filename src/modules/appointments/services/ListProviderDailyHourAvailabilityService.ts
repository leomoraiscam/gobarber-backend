/* eslint-disable lines-between-class-members */
import { injectable, inject } from 'tsyringe';
import { getHours, isAfter } from 'date-fns';
import IAppointmentRepository from '../repositories/IAppointmentRepository';
import {
  IListAvailableProviderHoursRequestDTO,
  ListAvailableProviderHoursResponse,
} from '../dtos/IListAvailableProviderHoursDTO';

@injectable()
class ListProviderDailyHourAvailabilityService {
  private APPOINTMENTS_SIZE = 10;
  private APPOINTMENTS_START_HOURS = 8;
  private OFF_SET_MONTHS = 1;

  constructor(
    @inject('AppointmentRepository')
    private appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(
    data: IListAvailableProviderHoursRequestDTO,
  ): Promise<ListAvailableProviderHoursResponse> {
    const { providerId, month, year, day } = data;
    const appointments =
      await this.appointmentRepository.findAllInDayFromProvider({
        providerId,
        month,
        year,
        day,
      });
    const eachHourArray = Array.from(
      {
        length: this.APPOINTMENTS_SIZE,
      },
      (_, index) => index + this.APPOINTMENTS_START_HOURS,
    );
    const currentDate = new Date(Date.now());

    return eachHourArray.map(hour => {
      const hasAppointmentInHour = appointments.find(
        appointment => getHours(appointment.date) === hour,
      );
      const appointmentDate = new Date(
        year,
        month - this.OFF_SET_MONTHS,
        day,
        hour,
      );

      return {
        hour,
        available:
          !hasAppointmentInHour && isAfter(appointmentDate, currentDate),
      };
    });
  }
}

export default ListProviderDailyHourAvailabilityService;
