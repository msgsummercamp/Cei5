import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function connectionsShouldBeDifferent(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const airportArray = control.get('airports');
    if (!airportArray || !Array.isArray(airportArray.value)) {
      return null;
    }
    const airports = control.get('airports')?.value;

    for (let i = 0; i < airports.length; i++) {
      airportArray?.get(`${i}`)?.setErrors(null);
      for (let j = i + 1; j < airports.length; j++) {
        if (airports[i] === airports[j]) {
          airportArray?.get(`${i}`)?.setErrors({ connectionsShouldBeDifferent: true });
          airportArray?.get(`${j}`)?.setErrors({ connectionsShouldBeDifferent: true });
        }
      }
    }
    return null;
  };
}
