import { injectable, inject } from 'tsyringe';
import { IDateProvider } from '@shared/container/providers/DateProvider/models/IDateProvider';
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
    @inject('DateProvider')
    private dateProvider: IDateProvider,
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
    const numberOfDaysInMonth = this.dateProvider.getDaysInMonth(
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
      const hasAppointmentsInDay = appointments.filter(appointment => {
        const getDayInDate = this.dateProvider.getDate(appointment.date);

        return getDayInDate === day;
      });
      const isBefore = this.dateProvider.compareIfBefore(
        compareEndDate,
        new Date(),
      );

      return {
        day,
        available:
          !isBefore &&
          hasAppointmentsInDay.length < this.MAX_APPOINTMENTS_PER_DAY,
      };
    });
  }
}
