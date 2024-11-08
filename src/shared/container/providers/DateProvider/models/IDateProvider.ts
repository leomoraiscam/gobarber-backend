export interface IDateProvider {
  dateNow(): Date;
  format(date: Date, to: string): unknown;
  getHours(hour: Date): number;
  getDate(date: Date): number;
  addHours(date: Date, hours: number): Date;
  compareIfBefore(startDate: Date, endDate: Date): boolean;
  getStartOfHour(hour: Date): Date;
  getDaysInMonth(date: Date): number;
}
