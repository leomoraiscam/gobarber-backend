import { injectable, inject } from 'tsyringe';
import { classToClass } from 'class-transformer';
import { ICacheProvider } from '@shared/container/providers/CacheProvider/models/ICacheProvider';
import { Appointment } from '../infra/typeorm/entities/Appointment';
import { IAppointmentRepository } from '../repositories/IAppointmentRepository';
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
    let appointments: Appointment[];

    const { providerId, month, year, day } = data;
    const appointmentsCacheKey = `provider-appointments:${providerId}:${year}-${month}-${day}`;

    appointments = await this.cacheProvider.recover<Appointment[]>(
      appointmentsCacheKey,
    );

    if (!appointments) {
      appointments = await this.appointmentRepository.findAllDailyByProvider({
        providerId,
        month,
        year,
        day,
      });

      await this.cacheProvider.save(
        appointmentsCacheKey,
        classToClass(appointments),
      );
    }

    return appointments;
  }
}
