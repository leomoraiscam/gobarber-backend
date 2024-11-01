export interface IListAvailableProviderHoursRequestDTO {
  providerId: string;
  month: number;
  year: number;
  day: number;
}

export type ListAvailableProviderHoursResponse = Array<{
  hour: number;
  available: boolean;
}>;
