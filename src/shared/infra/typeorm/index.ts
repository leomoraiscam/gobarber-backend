import {
  Connection,
  createConnections,
  getConnectionOptions,
  getConnectionManager,
} from 'typeorm';

export default async (host = 'localhost'): Promise<Connection> => {
  const defaultOptions = await getConnectionOptions();

  const connectionManager = getConnectionManager();

  if (connectionManager.has('default') && connectionManager.get('default').isConnected) {
    return connectionManager.get('default');
  }

  const connections = await createConnections([
    Object.assign(defaultOptions, {
      host,
      database:
        process.env.NODE_ENV === 'test'
          ? 'go-barber-test'
          : defaultOptions.database,
    }),
    {
      name: 'mongo',
      type: 'mongodb',
      host: 'localhost',
      port: 27017,
      database: process.env.NODE_ENV === 'test' ? 'gobarber_test' : 'gobarber',
      useUnifiedTopology: true,
      entities: ['./src/modules/**/infra/typeorm/schemas/*.ts'],
    },
  ]);

  return connections.find(c => c.name === 'default') || connections[0];
};
