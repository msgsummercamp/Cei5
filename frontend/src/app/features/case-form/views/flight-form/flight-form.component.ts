import { Component, effect, inject, input, output } from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessageModule } from 'primeng/message';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { arrivalAfterDepartureValidator } from '../../../../shared/validators/arrivalAfterDepartureValidator';
import { TranslatePipe } from '@ngx-translate/core';
import { notEmptyAfterTrimValidator } from '../../../../shared/validators/notEmptyAfterTrimValidator';

// Interface for flight details
export interface FlightDetails {
  flightNumber: string | null;
  airline: string | null;
  reservationNumber: string | null;
  departingAirport: string | null;
  destinationAirport: string | null;
  plannedDepartureTime: Date | null;
  plannedArrivalTime: Date | null;
}

type FlightDetailsForm = {
  flightNumber: FormControl<string | null>;
  airline: FormControl<string | null>;
  plannedDepartureTime: FormControl<Date | null>;
  plannedArrivalTime: FormControl<Date | null>;
};

@Component({
  selector: 'app-flight-form',
  imports: [
    CardModule,
    InputTextModule,
    ReactiveFormsModule,
    FloatLabelModule,
    DatePickerModule,
    AutoCompleteModule,
    MessageModule,
    ErrorMessageComponent,
    TranslatePipe,
  ],
  templateUrl: './flight-form.component.html',
  styleUrl: './flight-form.component.scss',
})
export class FlightFormComponent {
  private readonly _formBuilder = inject(NonNullableFormBuilder);

  // Date limits for flight date
  protected readonly maxDate = (() => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date;
  })();
  protected readonly minDate = (() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 3);
    return date;
  })();
  // Form group for flight details
  protected readonly flightDetailsForm = this._formBuilder.group<FlightDetailsForm>(
    {
      flightNumber: this._formBuilder.control<string | null>('', [
        Validators.minLength(3),
        Validators.maxLength(6),
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9]+$/),
      ]),
      airline: this._formBuilder.control<string>('', [
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.required,
        Validators.pattern(/^[a-zA-Z ]+$/),
        notEmptyAfterTrimValidator(),
      ]),
      plannedDepartureTime: this._formBuilder.control<Date | null>(null, [Validators.required]),
      plannedArrivalTime: this._formBuilder.control<Date | null>(null, [Validators.required]),
    },
    { validators: arrivalAfterDepartureValidator() }
  );

  // default title for the form
  public readonly title = input<string>('Flight Details');
  public readonly validityChange = output<{ valid: boolean; data: FlightDetails | null }>();
  public readonly initialData = input<FlightDetails | null>(null);

  // Getter for the form value
  public getFormValue(): FlightDetails | null {
    return this.flightDetailsForm.valid ? (this.flightDetailsForm.value as FlightDetails) : null;
  }

  constructor() {
    let hasInitialized = false;

    effect(() => {
      const data = this.initialData();
      if (data && !hasInitialized) {
        hasInitialized = true;

        this.flightDetailsForm.patchValue(
          {
            flightNumber: data.flightNumber,
            airline: data.airline,
            plannedDepartureTime: data.plannedDepartureTime,
            plannedArrivalTime: data.plannedArrivalTime,
          },
          { emitEvent: false }
        );

        setTimeout(() => {
          this.checkAndEmitValidity();
        }, 0);
      }
    });
  }

  // Function to check and emit validity of the form
  public checkAndEmitValidity(): void {
    const isValid = this.flightDetailsForm.valid;
    const data = isValid ? this.getFormValue() : null;
    this.validityChange.emit({ valid: isValid, data });
  }
}
