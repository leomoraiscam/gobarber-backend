import { ICreateNotificationDTO } from '../dtos/ICreateNotificationDTO';
import { Notification } from '../infra/typeorm/schemas/Notification';

export interface INotificationRepository {
  create(data: ICreateNotificationDTO): Promise<Notification>;
}
