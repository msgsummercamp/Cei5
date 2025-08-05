export type PasswordResetRequest = {
  password: string;
  isFirstLogin: boolean;
};

export type InitiatePasswordResetRequest = {
  email: string;
};
