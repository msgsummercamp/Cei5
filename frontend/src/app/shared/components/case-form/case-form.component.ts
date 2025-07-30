import { Component, inject, input } from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';
import { ListboxModule } from 'primeng/listbox';
import { IftaLabelModule } from 'primeng/iftalabel';
import { AutoCompleteModule } from 'primeng/autocomplete';

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
  ],
  templateUrl: './case-form.component.html',
  styleUrl: './case-form.component.scss',
})
export class CaseFormComponent {
  private readonly _formBuilder = inject(NonNullableFormBuilder);

  // TODO: validate data
  protected readonly flightDetailsForm =
    this._formBuilder.group<FlightDetailsForm>({
      flightDate: this._formBuilder.control<Date | null>(null),
      flightNumber: this._formBuilder.control<string>(''),
      airline: this._formBuilder.control<string>(''),
      departingAirport: this._formBuilder.control<string>(''),
      destinationAirport: this._formBuilder.control<string>(''),
      plannedDepartureTime: this._formBuilder.control<Date | null>(null),
      plannedArrivalTime: this._formBuilder.control<Date | null>(null),
    });

  // default title for the form
  public readonly title = input<string>('Flight Details');

  public getFormValue(): FlightDetails {
    return this.flightDetailsForm.value as FlightDetails;
  }
}
