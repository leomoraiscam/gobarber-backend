import { ICreateAppointmentDTO } from '@modules/appointments/dtos/ICreateAppointmentDTO';
import { Appointment } from '../infra/typeorm/entities/Appointment';
import { IFindMonthlyAppointmentsByProviderDTO } from '../dtos/IFindMonthlyAppointmentsByProviderDTO';
import { IFindDailyAppointmentsByProviderDTO } from '../dtos/IFindDailyAppointmentsByProviderDTO';
import { IFindAppointmentByDateDTO } from '../dtos/IFindAppointmentByDateDTO';

export interface IAppointmentRepository {
  findByDate(data: IFindAppointmentByDateDTO): Promise<Appointment | null>;
  findAllDailyByProvider(
    data: IFindDailyAppointmentsByProviderDTO,
  ): Promise<Appointment[] | null>;
  findAllMonthlyByProvider(
    data: IFindMonthlyAppointmentsByProviderDTO,
  ): Promise<Appointment[] | null>;
  create(data: ICreateAppointmentDTO): Promise<Appointment>;
}
