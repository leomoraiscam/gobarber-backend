import { injectable, inject } from 'tsyringe';
import { Appointment } from '@modules/appointments/infra/typeorm/entities/Appointment';
import { AppError } from '@shared/errors/AppError';
import { ICacheProvider } from '@shared/container/providers/CacheProvider/models/ICacheProvider';
import { IDateProvider } from '@shared/container/providers/DateProvider/models/IDateProvider';
import { IAppointmentRepository } from '../repositories/IAppointmentRepository';
import INotificationRepository from '../../notifications/repositories/INotificationRepository';
import { ICreateAppointmentDTO } from '../dtos/ICreateAppointmentDTO';

@injectable()
export class CreateAppointmentService {
  constructor(
    @inject('AppointmentRepository')
    private appointmentRepository: IAppointmentRepository,
    @inject('NotificationsRepository')
    private notificationsRepository: INotificationRepository,
    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
    @inject('DateProvider')
    private dateProvider: IDateProvider,
  ) {}

  public async execute(data: ICreateAppointmentDTO): Promise<Appointment> {
    const { date, providerId, userId } = data;
    const appointmentDate = this.dateProvider.getStartOfHour(date);
    const isPastDate = this.dateProvider.compareIfBefore(
      appointmentDate,
      this.dateProvider.dateNow(),
    );

    if (isPastDate) {
      throw new AppError("You can't create an appointment on a past date", 422);
    }

    if (userId === providerId) {
      throw new AppError("You can't create an appointment with yourself", 422);
    }

    const appointmentDateHour = this.dateProvider.getHours(appointmentDate);

    if (appointmentDateHour < 8 || appointmentDateHour > 17) {
      throw new AppError(
        "You can't create an appointments between 8am and 5pm",
        422,
      );
    }

    const findAppointmentInTheSameDate =
      await this.appointmentRepository.findByDate({
        date: appointmentDate,
        providerId,
      });

    if (findAppointmentInTheSameDate) {
      throw new AppError('This appointment is already booked', 409);
    }

    const appointment = await this.appointmentRepository.create({
      providerId,
      userId,
      date: appointmentDate,
    });
    const formattedDate = this.dateProvider.format(
      appointmentDate,
      "dd 'de' MMMM 'às' HH:mm'h'",
    );

    await this.notificationsRepository.create({
      recipient_id: providerId,
      content: `Novo agendamento para ${formattedDate}`,
    });

    const formattedDateToCacheKey = this.dateProvider.format(
      appointmentDate,
      'yyyy-M-d',
    );
    await this.cacheProvider.invalidate(
      `provider-appointments: ${providerId}:${formattedDateToCacheKey}`,
    );

    return appointment;
  }
}
