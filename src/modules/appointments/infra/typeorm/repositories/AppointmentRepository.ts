import { getRepository, Repository, Raw } from 'typeorm';
import { IAppointmentRepository } from '@modules/appointments/repositories/IAppointmentRepository';
import { ICreateAppointmentDTO } from '@modules/appointments/dtos/ICreateAppointmentDTO';
import { IFindDailyAppointmentsByProviderDTO } from '@modules/appointments/dtos/IFindDailyAppointmentsByProviderDTO';
import { IFindMonthlyAppointmentsByProviderDTO } from '@modules/appointments/dtos/IFindMonthlyAppointmentsByProviderDTO';
import { IFindAppointmentByDateDTO } from '@modules/appointments/dtos/IFindAppointmentByDateDTO';
import { Appointment } from '../entities/Appointment';

export class AppointmentRepository implements IAppointmentRepository {
  private ormRepository: Repository<Appointment>;

  constructor() {
    this.ormRepository = getRepository(Appointment);
  }

  public async findByDate(
    data: IFindAppointmentByDateDTO,
  ): Promise<Appointment | undefined> {
    const { date, providerId } = data;

    return this.ormRepository.findOne({
      where: {
        date,
        providerId,
      },
    });
  }

  public async findAllDailyByProvider(
    data: IFindDailyAppointmentsByProviderDTO,
  ): Promise<Appointment[]> {
    const { providerId, day, month, year } = data;
    const parserDay = String(day).padStart(2, '0');
    const parserMonth = String(month).padStart(2, '0');

    return this.ormRepository.find({
      where: {
        providerId,
        date: Raw(
          dateFieldName =>
            `to_char(${dateFieldName},'DD-MM-YYYY') = '${parserDay}-${parserMonth}-${year}'`,
        ),
      },
      relations: ['user'],
    });
  }

  public async findAllMonthlyByProvider(
    data: IFindMonthlyAppointmentsByProviderDTO,
  ): Promise<Appointment[]> {
    const { providerId, month, year } = data;
    const parserMonth = String(month).padStart(2, '0');

    return this.ormRepository.find({
      where: {
        providerId,
        date: Raw(
          dateFieldName =>
            `to_char(${dateFieldName},'MM-YYYY') = '${parserMonth}-${year}'`,
        ),
      },
    });
  }

  public async create(data: ICreateAppointmentDTO): Promise<Appointment> {
    const { providerId, userId, date } = data;
    const appointment = await this.ormRepository.create({
      providerId,
      date,
      userId,
    });

    await this.ormRepository.save(appointment);

    return appointment;
  }
}
