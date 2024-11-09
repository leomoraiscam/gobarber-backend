import { container } from 'tsyringe';
import './StorageProvider';
import './CacheProvider';

import { IMailProvider } from './MailProvider/models/IMailProvider';
import { EtherealMailProvider } from './MailProvider/implementations/EtherealMailProvider';
import { IMailTemplateProvider } from './MailTemplateProvider/models/IMailTemplateProvider';
import { HandlebarsMailTemplateProvider } from './MailTemplateProvider/implementations/HandlebarsMailTemplateProvider';
import { IHashProvider } from './HashProvider/models/IHashProvider';
import { BCryptHashProvider } from './HashProvider/implementations/BCryptHashProvider';
import { IDateProvider } from './DateProvider/models/IDateProvider';
import { DateFnsProvider } from './DateProvider/implementations/DateFnsProvider';

container.registerSingleton<IMailTemplateProvider>(
  'MailTemplateProvider',
  HandlebarsMailTemplateProvider,
);

container.registerInstance<IMailProvider>(
  'MailProvider',
  container.resolve(EtherealMailProvider),
);

container.registerSingleton<IHashProvider>('HashProvider', BCryptHashProvider);

container.registerSingleton<IDateProvider>('DateProvider', DateFnsProvider);
