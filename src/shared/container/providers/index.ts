import { container } from 'tsyringe';
import './StorageProvider';
import './CacheProvider';

import IStorageProvider from './StorageProvider/models/IStorageProvader';
import DiskStorageProvider from './StorageProvider/implementations/DiskStorageProvider';
import IMailProvider from './MailProvider/models/IMailProvider';
import EthrealMailProvider from './MailProvider/implementations/EthrealMailProvider';
import IMailTemplateProvider from './MailTemplateProvider/models/IMailTemplateProvider';
import HandlebarsMailTemplateProvider from './MailTemplateProvider/implementations/HandlebarsMailTemplateProvider';
import { IHashProvider } from './HashProvider/models/IHashProvider';
import { BCryptHashProvider } from './HashProvider/implementations/BCryptHashProvider';

container.registerSingleton<IStorageProvider>(
  'StorageProvider',
  DiskStorageProvider,
);

container.registerSingleton<IMailTemplateProvider>(
  'MailTemplateProvider',
  HandlebarsMailTemplateProvider,
);

container.registerInstance<IMailProvider>(
  'MailProvider',
  container.resolve(EthrealMailProvider),
);

container.registerSingleton<IHashProvider>('HashProvider', BCryptHashProvider);
