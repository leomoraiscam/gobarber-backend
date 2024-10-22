export interface IUpdateUserProfileDTO {
  userId: string;
  name: string;
  email: string;
  password?: string;
  oldPassword?: string;
}
