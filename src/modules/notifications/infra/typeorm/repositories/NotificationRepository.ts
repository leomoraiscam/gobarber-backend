import { getMongoRepository, MongoRepository } from 'typeorm';
import { INotificationRepository } from '@modules/notifications/repositories/INotificationRepository';
import { ICreateNotificationDTO } from '@modules/notifications/dtos/ICreateNotificationDTO';
import { Notification } from '@modules/notifications/infra/typeorm/schemas/Notification';

export class NotificationRepository implements INotificationRepository {
  private ormRepository: MongoRepository<Notification>;

  public async create({ content, recipientId }: ICreateNotificationDTO): Promise<Notification> {
    if (!this.ormRepository) {
      this.ormRepository = getMongoRepository(Notification, 'mongo');
    }

    const notification = this.ormRepository.create({
      content,
      recipientId,
    });

    await this.ormRepository.save(notification);

    return notification;
  }
}
