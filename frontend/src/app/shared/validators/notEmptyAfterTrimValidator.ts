import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function notEmptyAfterTrimValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (typeof value === 'string' && value.trim().length === 0) {
      return { notEmptyAfterTrim: true };
    }
    return null;
  };
}
