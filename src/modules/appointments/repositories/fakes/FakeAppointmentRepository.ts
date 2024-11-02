import { uuid as uuidV4 } from 'uuidv4';
import { IAppointmentRepository } from '@modules/appointments/repositories/IAppointmentRepository';
import { ICreateAppointmentDTO } from '@modules/appointments/dtos/ICreateAppointmentDTO';
import { IFindMonthlyAppointmentsByProviderDTO } from '@modules/appointments/dtos/IFindMonthlyAppointmentsByProviderDTO';
import { IFindDailyAppointmentsByProviderDTO } from '@modules/appointments/dtos/IFindDailyAppointmentsByProviderDTO';
import { Appointment } from '../../infra/typeorm/entities/Appointment';
import { IFindAppointmentByDateDTO } from '../../dtos/IFindAppointmentByDateDTO';

export class FakeAppointmentRepository implements IAppointmentRepository {
  private Appointments: Appointment[] = [];

  public async findByDate(
    data: IFindAppointmentByDateDTO,
  ): Promise<Appointment | undefined> {
    const { date, providerId } = data;

    return this.Appointments.find(
      appointment =>
        appointment.date.getTime() === date.getTime() &&
        appointment.providerId === providerId,
    );
  }

  public async findAllDailyByProvider(
    data: IFindDailyAppointmentsByProviderDTO,
  ): Promise<Appointment[]> {
    const { providerId, day, month, year } = data;

    return this.Appointments.filter(appointment => {
      const appointmentDate = appointment.date;
      return (
        appointment.providerId === providerId &&
        appointmentDate.getDate() === day &&
        appointmentDate.getMonth() + 1 === month &&
        appointmentDate.getFullYear() === year
      );
    });
  }

  public async findAllMonthlyByProvider(
    data: IFindMonthlyAppointmentsByProviderDTO,
  ): Promise<Appointment[]> {
    const { providerId, month, year } = data;

    return this.Appointments.filter(appointment => {
      const appointmentDate = appointment.date;
      return (
        appointment.providerId === providerId &&
        appointmentDate.getMonth() + 1 === month &&
        appointmentDate.getFullYear() === year
      );
    });
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
