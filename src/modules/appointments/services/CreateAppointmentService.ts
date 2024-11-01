import { startOfHour, isBefore, getHours, format } from 'date-fns';
import { injectable, inject } from 'tsyringe';
import { Appointment } from '@modules/appointments/infra/typeorm/entities/Appointments';
import AppError from '@shared/errors/AppError';
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';
import { IAppointmentRepository } from '../repositories/IAppointmentRepository';
import INotificationRepository from '../../notifications/repositories/INotificationRepository';
import { ICreateAppointmentDTO } from '../dtos/ICreateAppointmentDTO';

@injectable()
class CreateAppointmentService {
  constructor(
    @inject('AppointmentRepository')
    private appointmentRepository: IAppointmentRepository,
    @inject('NotificationsRepository')
    private notificationsRepository: INotificationRepository,
    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
  ) {}

  public async execute(data: ICreateAppointmentDTO): Promise<Appointment> {
    const { date, providerId, userId } = data;
    const appointmentDate = startOfHour(date);

    if (isBefore(appointmentDate, Date.now())) {
      throw new AppError("You can't create an appointment on a past date", 422);
    }

    if (userId === providerId) {
      throw new AppError("You can't create an appointment with yourself", 422);
    }

    if (getHours(appointmentDate) < 8 || getHours(appointmentDate) > 17) {
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
    const formattedDate = format(appointmentDate, "dd 'de' MMMM 'às' HH:mm'h'");

    await this.notificationsRepository.create({
      recipient_id: providerId,
      content: `Novo agendamento para ${formattedDate}`,
    });

    await this.cacheProvider.invalidate(
      `provider-appointments: ${providerId}:${format(
        appointmentDate,
        'yyyy-M-d',
      )}`,
    );

    return appointment;
  }
}

export default CreateAppointmentService;
