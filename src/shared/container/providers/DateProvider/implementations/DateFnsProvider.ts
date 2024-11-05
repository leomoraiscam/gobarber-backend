import {
  startOfHour,
  isBefore,
  getHours,
  format,
  getDaysInMonth,
  getDate,
  addHours,
} from 'date-fns';
import { IDateProvider } from '../models/IDateProvider';

export class DateFnsProvider implements IDateProvider {
  format(date: Date, to: string): unknown {
    return format(date, to);
  }

  dateNow(): Date {
    return new Date();
  }

  getHours(date: Date): number {
    return getHours(date);
  }

  getDate(date: Date): number {
    return getDate(date);
  }

  addHours(date: Date, hours: number): Date {
    return addHours(date, hours);
  }

  compareIfBefore(startDate: Date, endDate: Date): boolean {
    return isBefore(startDate, endDate);
  }

  getStartOfHour(date: Date): Date {
    return startOfHour(date);
  }

  getDaysInMonth(date: Date): number {
    return getDaysInMonth(date);
  }
}
