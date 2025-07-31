import { Component, inject, input, output, effect } from '@angular/core';
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
import { ListboxModule } from 'primeng/listbox';
import { IftaLabelModule } from 'primeng/iftalabel';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessageModule } from 'primeng/message';

// Interface for flight details
export interface FlightDetails {
  flightDate: Date | null;
  flightNumber: string;
  airline: string;
  reservationNumber: string;
  departingAirport: string;
  destinationAirport: string;
  plannedDepartureTime: Date | null;
  plannedArrivalTime: Date | null;
}

type FlightDetailsForm = {
  flightDate: FormControl<Date | null>;
  flightNumber: FormControl<string>;
  airline: FormControl<string>;
  departingAirport: FormControl<string>;
  destinationAirport: FormControl<string>;
  plannedDepartureTime: FormControl<Date | null>;
  plannedArrivalTime: FormControl<Date | null>;
};

@Component({
  selector: 'app-case-form',
  imports: [
    CardModule,
    InputTextModule,
    ReactiveFormsModule,
    FloatLabelModule,
    DatePickerModule,
    ListboxModule,
    IftaLabelModule,
    AutoCompleteModule,
    MessageModule,
  ],
  templateUrl: './case-form.component.html',
  styleUrl: './case-form.component.scss',
})
export class CaseFormComponent {
  private readonly _formBuilder = inject(NonNullableFormBuilder);

  // Date limits for flight date
  protected readonly maxDate = new Date();
  protected readonly minDate = (() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 3);
    return date;
  })();
  // Form group for flight details
  protected readonly flightDetailsForm = this._formBuilder.group<FlightDetailsForm>({
    flightDate: this._formBuilder.control<Date | null>(null, [Validators.required]),
    flightNumber: this._formBuilder.control<string>('', [
      Validators.minLength(3),
      Validators.maxLength(6),
      Validators.required,
    ]),
    airline: this._formBuilder.control<string>('', [
      Validators.minLength(3),
      Validators.maxLength(50),
      Validators.required,
    ]),
    departingAirport: this._formBuilder.control<string>('', [
      Validators.minLength(3),
      Validators.maxLength(3),
      Validators.required,
    ]),
    destinationAirport: this._formBuilder.control<string>('', [
      Validators.minLength(3),
      Validators.maxLength(3),
      Validators.required,
    ]),
    plannedDepartureTime: this._formBuilder.control<Date | null>(null, [Validators.required]),
    plannedArrivalTime: this._formBuilder.control<Date | null>(null, [Validators.required]),
  });

  // default title for the form
  public readonly title = input<string>('Flight Details');
  public readonly validityChange = output<{ valid: boolean; data: FlightDetails | null }>();
  public readonly initialData = input<FlightDetails | null>(null);

  // Getter for the form value
  public getFormValue(): FlightDetails | null {
    return this.flightDetailsForm.valid ? (this.flightDetailsForm.value as FlightDetails) : null;
  }

  constructor() {
    // For data persistance during stepping
    effect(() => {
      const data = this.initialData();
      if (data) {
        this.flightDetailsForm.patchValue({
          flightDate: data.flightDate,
          flightNumber: data.flightNumber,
          airline: data.airline,
          departingAirport: data.departingAirport,
          destinationAirport: data.destinationAirport,
          plannedDepartureTime: data.plannedDepartureTime,
          plannedArrivalTime: data.plannedArrivalTime,
        });
      }
    });

    // Subscribe to form changes
    this.flightDetailsForm.valueChanges.subscribe(() => {
      const isValid = this.flightDetailsForm.valid;
      const data = isValid ? (this.flightDetailsForm.value as FlightDetails) : null;

      this.validityChange.emit({
        valid: isValid,
        data: data,
      });
    });

    // Also emit on status changes
    this.flightDetailsForm.statusChanges.subscribe(() => {
      const isValid = this.flightDetailsForm.valid;
      const data = isValid ? (this.flightDetailsForm.value as FlightDetails) : null;

      this.validityChange.emit({
        valid: isValid,
        data: data,
      });
    });
  }
}
