import { IDateProvider } from '../models/IDateProvider';

export class FakeDateProvider implements IDateProvider {
  private readonly MONTH_OFFSET = 1;
  private readonly BEGIN_OF_DAY_HOUR = 0;
  private readonly BEGIN_OF_HOUR_MINUTE = 0;
  private readonly BEGIN_SECOND_OF_MINUTE = 0;
  private currentDate: Date;

  constructor() {
    this.currentDate = new Date();
  }

  private normalizeToHour(date: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
    );
  }

  setCurrentDate(date: Date): void {
    this.currentDate = date;
  }

  dateNow(): Date {
    return this.currentDate;
  }

  format(date: Date, to: string): string {
    return `${date.toDateString()} - formatted as ${to}`;
  }

  getHours(hour: Date): number {
    return hour.getHours();
  }

  getDate(date: Date): number {
    return date.getDate();
  }

  getStartOfHour(date: Date): Date {
    const newDate = new Date(date);

    newDate.setMinutes(
      this.BEGIN_OF_DAY_HOUR,
      this.BEGIN_OF_HOUR_MINUTE,
      this.BEGIN_SECOND_OF_MINUTE,
    );
    return newDate;
  }

  getDaysInMonth(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + this.MONTH_OFFSET;

    return new Date(year, month, this.BEGIN_OF_DAY_HOUR).getDate();
  }

  addHours(date: Date, hours: number): Date {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);

    return newDate;
  }

  compareIfBefore(startDate: Date, endDate: Date): boolean {
    const start = this.normalizeToHour(startDate);
    const end = this.normalizeToHour(endDate);

    return start.getTime() <= end.getTime();
  }
}
