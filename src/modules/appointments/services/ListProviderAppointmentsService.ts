import { injectable, inject } from 'tsyringe';
import { ICacheProvider } from '@shared/container/providers/CacheProvider/models/ICacheProvider';
import { classToClass } from 'class-transformer';
import { IAppointmentRepository } from '../repositories/IAppointmentRepository';
import { Appointment } from '../infra/typeorm/entities/Appointment';
import { IFindDailyAppointmentsByProviderDTO } from '../dtos/IFindDailyAppointmentsByProviderDTO';

@injectable()
export class ListProviderAppointmentsService {
  constructor(
    @inject('AppointmentRepository')
    private appointmentRepository: IAppointmentRepository,
    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
  ) {}

  async execute(
    data: IFindDailyAppointmentsByProviderDTO,
  ): Promise<Appointment[]> {
    const { providerId, month, year, day } = data;
    const cacheKey = `provider-appointments: ${providerId}:${year}-${month}-${day}`;

    let appointments = await this.cacheProvider.recover<Appointment[]>(
      cacheKey,
    );

    if (!appointments) {
      appointments = await this.appointmentRepository.findAllDailyByProvider({
        providerId,
        month,
        year,
        day,
      });

      await this.cacheProvider.save(cacheKey, classToClass(appointments));
    }

    return appointments;
  }
}
