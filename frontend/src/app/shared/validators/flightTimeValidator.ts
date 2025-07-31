import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { arrivalAfterDepartureValidator } from './arrivalAfterDepartureValidator';
import { flightDateMatchesDepartureValidator } from './flightDateMatchesDepartureValidator';

export function flightTimeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const errors: ValidationErrors = {};

    // Check arrival after departure
    const arrivalError = arrivalAfterDepartureValidator()(control);
    if (arrivalError) {
      Object.assign(errors, arrivalError);
    }

    // Check flight date matches departure date
    const dateError = flightDateMatchesDepartureValidator()(control);
    if (dateError) {
      Object.assign(errors, dateError);
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}
