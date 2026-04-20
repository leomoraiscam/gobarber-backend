import 'reflect-metadata';

process.env.STORAGE_DRIVER = 'disk';
process.env.MAIL_DRIVER = 'ethereal';

import '@shared/container';
import { container } from 'tsyringe';
import { FakeMailProvider } from '@shared/container/providers/MailProvider/fakes/FakeMailProvider';

jest.mock('ioredis', () => require('ioredis-mock'));
jest.mock('@shared/container/providers/MailProvider/implementations/EtherealMailProvider', () => {
  return {
    EtherealMailProvider: jest.fn().mockImplementation(() => {
      return {
        sendMail: jest.fn(),
      };
    }),
  };
});

container.registerInstance('MailProvider', new FakeMailProvider());

import { getConnectionManager, Connection } from 'typeorm';
import createConnection from '@shared/infra/typeorm';

beforeAll(async () => {
  try {
    await createConnection();
    const connectionManager = getConnectionManager();
    const connections = connectionManager.connections;

    for (const connection of connections) {
      if (connection.isConnected) {
        if (connection.name === 'default') {
          await connection.runMigrations();

          const entities = connection.entityMetadatas;
          const promises = entities
            .filter(entity => entity.tableName !== 'migrations')
            .map(entity =>
              connection
                .query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`)
                .catch(() => {}),
            );

          await Promise.all(promises);
        } else if (connection.name === 'mongo') {
          const collections = connection.entityMetadatas;
          const promises = collections.map(collection =>
            connection.getMongoRepository(collection.target).clear().catch(() => {}),
          );

          await Promise.all(promises);
        }
      }
    }

    const redis = require('ioredis');
    const redisMock = new redis();
    await redisMock.flushall();
  } catch (error) {
    console.error('Error in beforeAll:', error);
  }
});

afterAll(async () => {
  const connectionManager = getConnectionManager();
  const connections = connectionManager.connections;
  await Promise.all(
    connections.map(connection =>
      connection.isConnected ? connection.close() : Promise.resolve(),
    ),
  );
});
