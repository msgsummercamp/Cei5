import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordsMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!newPassword || !confirmPassword) {
      return { passwordMismatch: true };
    }

    if (newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  };
}
