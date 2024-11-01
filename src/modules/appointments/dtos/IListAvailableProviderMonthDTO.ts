export interface IListAvailableProviderMonthRequestDTO {
  providerId: string;
  month: number;
  year: number;
}

export type ListAvailableProviderMonthResponse = Array<{
  day: number;
  available: boolean;
}>;
