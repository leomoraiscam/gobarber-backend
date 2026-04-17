import { injectable, inject } from 'tsyringe';
import { Appointment } from '@modules/appointments/infra/typeorm/entities/Appointment';
import { AppError } from '@shared/errors/AppError';
import { ICacheProvider } from '@shared/container/providers/CacheProvider/models/ICacheProvider';
import { IDateProvider } from '@shared/container/providers/DateProvider/models/IDateProvider';
import { IUserRepository } from '@modules/users/repositories/IUserRepository';
import { IAppointmentRepository } from '../repositories/IAppointmentRepository';
// import { INotificationRepository } from '../../notifications/repositories/INotificationRepository';
import { ICreateAppointmentDTO } from '../dtos/ICreateAppointmentDTO';

@injectable()
export class CreateAppointmentService {
  private MIN_APPOINTMENT_HOUR = 8;
  private MAX_APPOINTMENT_HOUR = 17;

  constructor(
    @inject('AppointmentRepository')
    private appointmentRepository: IAppointmentRepository,
    // @inject('NotificationRepository')
    // private notificationRepository: INotificationRepository,
    @inject('UserRepository')
    private userRepository: IUserRepository,
    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
    @inject('DateProvider')
    private dateProvider: IDateProvider,
  ) {}

  public async execute(data: ICreateAppointmentDTO): Promise<Appointment> {
    const { date, providerId, userId } = data;
    const appointmentDate = this.dateProvider.getStartOfHour(date);
    const currentDate = this.dateProvider.dateNow();
    const isPastDate = this.dateProvider.compareIfBefore(
      appointmentDate,
      currentDate,
    );

    const provider = await this.userRepository.findById(providerId);

    if (!provider) {
      throw new AppError('Provider not found', 404);
    }

    if (isPastDate) {
      throw new AppError("You can't create an appointment on a past date", 422);
    }

    if (userId === providerId) {
      throw new AppError("You can't create an appointment with yourself", 422);
    }

    const appointmentHours = this.dateProvider.getHours(appointmentDate);

    if (
      appointmentHours < this.MIN_APPOINTMENT_HOUR ||
      appointmentHours > this.MAX_APPOINTMENT_HOUR
    ) {
      throw new AppError(
        "You can't create an appointments between 8am and 5pm",
        422,
      );
    }

    const hasAppointmentInTheSameDate =
      !!(await this.appointmentRepository.findByDate({
        date: appointmentDate,
        providerId,
      }));

    if (hasAppointmentInTheSameDate) {
      throw new AppError('This appointment is already booked', 409);
    }

    const appointment = await this.appointmentRepository.create({
      providerId,
      userId,
      date: appointmentDate,
    });
    // const notificationAppointmentDate = this.dateProvider.format(
    //   appointmentDate,
    //   "dd 'de' MMMM 'às' HH:mm'h'",
    // );

    // await this.notificationRepository.create({
    //   recipientId: providerId,
    //   content: `Novo agendamento para ${notificationAppointmentDate}`,
    // });

    const appointmentCacheKeyDate = this.dateProvider.format(
      appointmentDate,
      'yyyy-M-d',
    );

    await this.cacheProvider.invalidate(
      `provider-appointments:${providerId}:${appointmentCacheKeyDate}`,
    );

    return appointment;
  }
}
