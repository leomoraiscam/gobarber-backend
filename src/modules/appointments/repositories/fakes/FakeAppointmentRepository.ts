import { uuid as uuidV4 } from 'uuidv4';
import { getMonth, getYear, getDate, isEqual } from 'date-fns';
import { IAppointmentRepository } from '@modules/appointments/repositories/IAppointmentRepository';
import { ICreateAppointmentDTO } from '@modules/appointments/dtos/ICreateAppointmentDTO';
import { IFindAllInMonthFromProviderDTO } from '@modules/appointments/dtos/IFindAllInMonthFromProviderDTO';
import { IFindAllInDayFromProviderDTO } from '@modules/appointments/dtos/IFindAllInDayFromProviderDTO';
import { Appointment } from '../../infra/typeorm/entities/Appointments';
import { IFindAppointmentByDateDTO } from '../../dtos/IFindAppointmentByDateDTO';

export class FakeAppointmentRepository implements IAppointmentRepository {
  private Appointments: Appointment[] = [];

  public async findByDate(
    data: IFindAppointmentByDateDTO,
  ): Promise<Appointment | undefined> {
    const { date, providerId } = data;

    return this.Appointments.find(
      appointment =>
        isEqual(appointment.date, date) &&
        appointment.providerId === providerId,
    );
  }

  public async findAllInDayFromProvider(
    data: IFindAllInDayFromProviderDTO,
  ): Promise<Appointment[]> {
    const { providerId, day, month, year } = data;

    return this.Appointments.filter(
      appointment =>
        appointment.providerId === providerId &&
        getDate(appointment.date) === day &&
        getMonth(appointment.date) + 1 === month &&
        getYear(appointment.date) === year,
    );
  }

  public async findAllInMonthFromProvider(
    data: IFindAllInMonthFromProviderDTO,
  ): Promise<Appointment[]> {
    const { providerId, month, year } = data;

    return this.Appointments.filter(
      appointment =>
        appointment.providerId === providerId &&
        getMonth(appointment.date) + 1 === month &&
        getYear(appointment.date) === year,
    );
  }

  public async create(data: ICreateAppointmentDTO): Promise<Appointment> {
    const { providerId, userId, date } = data;
    const appointment = new Appointment();

    Object.assign(appointment, {
      id: uuidV4(),
      date,
      providerId,
      userId,
    });

    this.Appointments.push(appointment);

    return appointment;
  }
}
