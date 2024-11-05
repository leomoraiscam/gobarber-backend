export interface IDateProvider {
  dateNow(): Date;
  format(date: Date, to: string): unknown;
  getHours(hour: Date): unknown;
  getDate(date: Date): unknown;
  addHours(date: Date, hours: number): Date;
  compareIfBefore(startDate: Date, endDate: Date): unknown;
  getStartOfHour(hour: Date): Date;
  getDaysInMonth(date: Date): number;
}
