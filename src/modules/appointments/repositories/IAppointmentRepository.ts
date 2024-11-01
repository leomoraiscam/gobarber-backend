import { ICreateAppointmentDTO } from '@modules/appointments/dtos/ICreateAppointmentDTO';
import { Appointment } from '../infra/typeorm/entities/Appointment';
import { IFindAllInMonthFromProviderDTO } from '../dtos/IFindAllInMonthFromProviderDTO';
import { IFindAllInDayFromProviderDTO } from '../dtos/IFindAllInDayFromProviderDTO';
import { IFindAppointmentByDateDTO } from '../dtos/IFindAppointmentByDateDTO';

export interface IAppointmentRepository {
  findByDate(data: IFindAppointmentByDateDTO): Promise<Appointment | null>;
  findAllInDayFromProvider(
    data: IFindAllInDayFromProviderDTO,
  ): Promise<Appointment[] | null>;
  findAllInMonthFromProvider(
    data: IFindAllInMonthFromProviderDTO,
  ): Promise<Appointment[] | null>;
  create(data: ICreateAppointmentDTO): Promise<Appointment>;
}
