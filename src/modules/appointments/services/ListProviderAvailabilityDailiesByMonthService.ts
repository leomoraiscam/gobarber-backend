import { injectable, inject } from 'tsyringe';
import { IDateProvider } from '@shared/container/providers/DateProvider/models/IDateProvider';
import { IAppointmentRepository } from '../repositories/IAppointmentRepository';
import { ListProviderAvailableDaysResponse } from '../dtos/ListProviderAvailableDaysDTO';
import { IFindMonthlyAppointmentsByProviderDTO } from '../dtos/IFindMonthlyAppointmentsByProviderDTO';

@injectable()
export class ListProviderAvailabilityDailiesByMonthService {
  private readonly MAX_APPOINTMENTS_PER_DAY = 10;
  private readonly MONTH_OFFSET = 1;
  private readonly INDEX_OFFSET = 1;
  private readonly LAST_OF_DAY_HOUR = 23;
  private readonly LAST_OF_HOUR_MINUTE = 59;
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
    const date = new Date(year, month - this.MONTH_OFFSET);
    const numberOfDaysInMonth = this.dateProvider.getDaysInMonth(date);
    const eachDays = Array.from(
      {
        length: numberOfDaysInMonth,
      },
      (_, index) => index + this.INDEX_OFFSET,
    );

    return eachDays.map(day => {
      const dateWithEndOfDay = new Date(
        year,
        month - this.MONTH_OFFSET,
        day,
        this.LAST_OF_DAY_HOUR,
        this.LAST_OF_HOUR_MINUTE,
        this.LAST_SECOND_OF_MINUTE,
      );
      const appointmentsInDay = appointments.filter(appointment => {
        const getDayInDate = this.dateProvider.getDate(appointment.date);

        return getDayInDate === day;
      });
      const currentDate = new Date();
      const isBefore = this.dateProvider.compareIfBefore(
        dateWithEndOfDay,
        currentDate,
      );
      const isAvailable =
        !isBefore && appointmentsInDay.length < this.MAX_APPOINTMENTS_PER_DAY;

      return {
        day,
        available: isAvailable,
      };
    });
  }
}
