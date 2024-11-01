/* eslint-disable lines-between-class-members */
import { injectable, inject } from 'tsyringe';
import { getDaysInMonth, getDate, isAfter } from 'date-fns';
import IAppointmentRepository from '../repositories/IAppointmentRepository';
import {
  IListAvailableProviderMonthRequestDTO,
  ListAvailableProviderMonthResponse,
} from '../dtos/IListAvailableProviderMonthDTO';

@injectable()
class ListProviderDailyAvailabilityByMonthService {
  private APPOINTMENTS_SIZE = 10;
  private OFF_SET_MONTHS = 1;
  private OFF_SET_INDEX = 1;
  private LIMIT_HOURS = 23;
  private LIMIT_MINUTES = 59;
  private LIMIT_SECONDS = 59;

  constructor(
    @inject('AppointmentRepository')
    private appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(
    data: IListAvailableProviderMonthRequestDTO,
  ): Promise<ListAvailableProviderMonthResponse> {
    const { providerId, month, year } = data;
    const appointments =
      await this.appointmentRepository.findAllInMonthFromProvider({
        providerId,
        month,
        year,
      });
    const numberOfDaysInMonth = getDaysInMonth(
      new Date(year, month - this.OFF_SET_MONTHS),
    );
    const eachDayArray = Array.from(
      {
        length: numberOfDaysInMonth,
      },
      (_, index) => index + this.OFF_SET_INDEX,
    );

    return eachDayArray.map(day => {
      const compareDate = new Date(
        year,
        month - this.OFF_SET_MONTHS,
        day,
        this.LIMIT_HOURS,
        this.LIMIT_MINUTES,
        this.LIMIT_SECONDS,
      );
      const hasAppointmentsInDay = appointments.filter(
        appointment => getDate(appointment.date) === day,
      );

      return {
        day,
        available:
          isAfter(compareDate, new Date()) &&
          hasAppointmentsInDay.length < this.APPOINTMENTS_SIZE,
      };
    });
  }
}

export default ListProviderDailyAvailabilityByMonthService;
