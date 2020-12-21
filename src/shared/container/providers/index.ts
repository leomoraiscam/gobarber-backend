import { container } from 'tsyringe';
import IStorageProvider from './StorageProvider/models/IStorageProvader';
import DiskStorageProvider from './StorageProvider/implementations/DiskStorageProvider';
// import IMailProvider from './MailProvider/models/IMailProvider';
// import MailProvider from './MailProvider/implementations';

container.registerSingleton<IStorageProvider>(
  'StorageProvider',
  DiskStorageProvider,
);
