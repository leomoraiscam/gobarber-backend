export default interface IListAvailableProviderHoursRequestDTO {
  providerId: string;
  month: number;
  year: number;
  day: number;
}

export type ListAvailableProviderHoursServiceResponse = Array<{
  hour: number;
  available: boolean;
}>;
