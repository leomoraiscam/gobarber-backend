import { getMongoRepository, MongoRepository } from 'typeorm';
import { INotificationRepository } from '@modules/notifications/repositories/INotificationRepository';
import { ICreateNotificationDTO } from '@modules/notifications/dtos/ICreateNotificationDTO';
import { Notification } from '@modules/notifications/infra/typeorm/schemas/Notification';

export class NotificationRepository implements INotificationRepository {
  private ormRepository: MongoRepository<Notification>;

  constructor() {
    this.ormRepository = getMongoRepository(Notification, 'mongo');
  }

  public async create(data: ICreateNotificationDTO): Promise<Notification> {
    const { content, recipientId } = data;
    const notification = await this.ormRepository.create({
      content,
      recipientId,
    });

    await this.ormRepository.save(notification);

    return notification;
  }
}
