import { IDateProvider } from '../models/IDateProvider';

export class FakeDateProvider implements IDateProvider {
  private currentDate: Date;
  private readonly MONTH_INDEX_OFFSET = 1;
  private readonly MILLISECONDS_IN_MINUTE = 1000 * 60;
  private readonly MILLISECONDS_IN_HOUR = 1000 * 60 * 60;

  constructor() {
    this.currentDate = new Date();
  }

  private getMonthName(month: number): string {
    const monthNames = [
      'jan',
      'fev',
      'mar',
      'abr',
      'mai',
      'jun',
      'jul',
      'ago',
      'set',
      'out',
      'nov',
      'dez',
    ];
    return monthNames[month - this.MONTH_INDEX_OFFSET];
  }

  convertToUTC(date: Date): string {
    const utcDate = new Date(
      date.getTime() + date.getTimezoneOffset() * this.MILLISECONDS_IN_MINUTE,
    );

    return utcDate.toISOString();
  }

  setCurrentDate(date: Date): void {
    this.currentDate = date;
  }

  format(date: Date, to: string): string {
    return `${date.toDateString()} - formatted as ${to}`;
  }

  dateNow(): Date {
    return this.currentDate;
  }

  getHours(hour: Date): string {
    return hour.toTimeString();
  }

  getDate(date: Date): string {
    const day = date.getDate();
    const month = this.getMonthName(date.getMonth() + 1);
    const year = date.getFullYear();

    return `${day}, ${month} ${year}`;
  }

  addHours(date: Date, hours: number): Date {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    return newDate;
  }

  compareIfBefore(startDate: Date, endDate: Date): unknown {
    const endDateUTC = this.convertToUTC(endDate);
    const startDateUTC = this.convertToUTC(startDate);

    return (
      Math.abs(
        new Date(endDateUTC).getTime() - new Date(startDateUTC).getTime(),
      ) / this.MILLISECONDS_IN_HOUR
    );
  }

  getStartOfHour(date: Date): Date {
    const newDate = new Date(date);

    newDate.setMinutes(0, 0, 0);
    return newDate;
  }

  getDaysInMonth(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    return new Date(year, month, 0).getDate();
  }
}
