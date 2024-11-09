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
  dateNow(): Date {
    return new Date();
  }

  format(date: Date, to: string): string {
    return format(date, to);
  }

  getHours(date: Date): number {
    return getHours(date);
  }

  getDate(date: Date): number {
    return getDate(date);
  }

  getStartOfHour(date: Date): Date {
    return startOfHour(date);
  }

  getDaysInMonth(date: Date): number {
    return getDaysInMonth(date);
  }

  addHours(date: Date, hours: number): Date {
    return addHours(date, hours);
  }

  compareIfBefore(startDate: Date, endDate: Date): boolean {
    return isBefore(startDate, endDate);
  }
}
