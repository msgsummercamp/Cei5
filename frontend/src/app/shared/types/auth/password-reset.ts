export type PasswordResetRequest = {
  newPassword: string;
  isFirstLogin: boolean;
};

export type InitiatePasswordResetRequest = {
  email: string;
};
