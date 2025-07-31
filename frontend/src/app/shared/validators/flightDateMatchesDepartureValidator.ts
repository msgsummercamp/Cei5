import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function flightDateMatchesDepartureValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const flightDate = control.get('flightDate')?.value;
    const plannedDepartureTime = control.get('plannedDepartureTime')?.value;

    // Don't validate if either value is missing
    if (!flightDate || !plannedDepartureTime) {
      return null;
    }

    const flight = new Date(flightDate);
    const departure = new Date(plannedDepartureTime);

    // Compare only the date parts (ignore time)
    const flightDateOnly = new Date(flight.getFullYear(), flight.getMonth(), flight.getDate());
    const departureDateOnly = new Date(
      departure.getFullYear(),
      departure.getMonth(),
      departure.getDate()
    );

    if (flightDateOnly.getTime() !== departureDateOnly.getTime()) {
      return {
        flightDateMismatch: {
          flightDate: flightDateOnly.toISOString(),
          departureDate: departureDateOnly.toISOString(),
          message: 'Flight date must match the departure date',
        },
      };
    }

    return null;
  };
}
