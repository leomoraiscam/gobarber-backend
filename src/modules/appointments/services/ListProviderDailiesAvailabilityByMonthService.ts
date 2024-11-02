/* eslint-disable lines-between-class-members */
import { injectable, inject } from 'tsyringe';
import { getDaysInMonth, getDate, isAfter } from 'date-fns';
import { IAppointmentRepository } from '../repositories/IAppointmentRepository';
import { ListProviderAvailableDaysResponse } from '../dtos/ListProviderAvailableDaysDTO';
import { IFindMonthlyAppointmentsByProviderDTO } from '../dtos/IFindMonthlyAppointmentsByProviderDTO';

@injectable()
export class ListProviderDailiesAvailabilityByMonthService {
  private readonly MAX_APPOINTMENTS_PER_DAY = 10;
  private readonly MONTH_OFFSET = 1;
  private readonly END_OF_DAY_HOUR = 23;
  private readonly END_OF_HOUR_MINUTE = 59;
  private readonly LAST_SECOND_OF_MINUTE = 59;

  constructor(
    @inject('AppointmentRepository')
    private appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(
    data: IFindMonthlyAppointmentsByProviderDTO,
  ): Promise<ListProviderAvailableDaysResponse> {
    const { providerId, month, year } = data;
    const appointments =
      await this.appointmentRepository.findAllMonthlyByProvider({
        providerId,
        month,
        year,
      });
    const numberOfDaysInMonth = getDaysInMonth(
      new Date(year, month - this.MONTH_OFFSET),
    );
    const eachDay = Array.from(
      {
        length: numberOfDaysInMonth,
      },
      (_, index) => index + 1,
    );

    return eachDay.map(day => {
      const compareEndDate = new Date(
        year,
        month - this.MONTH_OFFSET,
        day,
        this.END_OF_DAY_HOUR,
        this.END_OF_HOUR_MINUTE,
        this.LAST_SECOND_OF_MINUTE,
      );
      const hasAppointmentsInDay = appointments.filter(
        appointment => getDate(appointment.date) === day,
      );

      return {
        day,
        available:
          isAfter(compareEndDate, new Date()) &&
          hasAppointmentsInDay.length < this.MAX_APPOINTMENTS_PER_DAY,
      };
    });
  }
}
