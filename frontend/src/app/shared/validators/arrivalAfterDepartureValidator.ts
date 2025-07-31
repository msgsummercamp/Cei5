import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function arrivalAfterDepartureValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const departureTime = control.get('plannedDepartureTime')?.value;
    const arrivalTime = control.get('plannedArrivalTime')?.value;

    if (!departureTime || !arrivalTime) {
      return null;
    }

    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);

    if (arrival <= departure) {
      return { arrivalBeforeDeparture: true };
    }

    return null;
  };
}
