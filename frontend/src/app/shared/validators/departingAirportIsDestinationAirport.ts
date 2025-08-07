import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function departingAirportIsDestinationAirport(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const departingAirport = control.get('departingAirport')?.value;
    const destinationAirport = control.get('destinationAirport')?.value;

    if (destinationAirport === departingAirport) {
      return { destinationIsDeparting: true };
    }
    return null;
  };
}
