import { injectable, inject } from 'tsyringe';
import { getHours, isAfter } from 'date-fns';
import IAppointmentsRepository from '../repositories/IAppointmentsRepository';
import IListAvailableProviderHoursRequestDTO, {
  ListAvailableProviderHoursServiceResponse,
} from '../dtos/IListAvailableProviderHoursDTO';

@injectable()
class ListAvailableProviderHoursByDayService {
  private APPOINTMENTS_SIZE = 10;

  private APPOINTMENTS_START_HOURS = 8;

  private OFF_SET_MONTHS = 1;

  constructor(
    @inject('AppointmentsRepository')
    private appointmentsRepository: IAppointmentsRepository,
  ) {}

  async execute(
    data: IListAvailableProviderHoursRequestDTO,
  ): Promise<ListAvailableProviderHoursServiceResponse> {
    const { providerId, month, year, day } = data;
    const appointments =
      await this.appointmentsRepository.findAllInDayFromProvider({
        provider_id: providerId,
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
    const availabilityHours = eachHourArray.map(hour => {
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

    return availabilityHours;
  }
}

export default ListAvailableProviderHoursByDayService;
