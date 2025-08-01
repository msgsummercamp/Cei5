import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { StepperModule } from 'primeng/stepper';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ErrorMessageComponent } from '../error-message/error-message.component';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { FlightDetails, CaseFormComponent } from '../case-form/case-form.component';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-case-start',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    StepperModule,
    CardModule,
    FloatLabelModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    ButtonModule,
    InputTextModule,
    CaseFormComponent,
    MessageModule,
    ErrorMessageComponent,
    FormsModule,
    TagModule,
  ],
  templateUrl: './case-start.component.html',
  styleUrl: './case-start.component.scss',
})
export class CaseStartComponent {
  public readonly MAXIMUM_CONNECTIONS = 4;

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  // Form for reservation details
  protected readonly reservationForm = this._formBuilder.group({
    reservationNumber: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6),
    ]),
    departingAirport: new FormControl<string>('', [
      Validators.minLength(3),
      Validators.maxLength(3),
      Validators.required,
    ]),
    destinationAirport: new FormControl<string>('', [
      Validators.minLength(3),
      Validators.maxLength(3),
      Validators.required,
    ]),
  });

  public currentStep = 1;
  public isFlightFormValid = false;
  public flightData: FlightDetails | null = null;
  public airports: string[] = [];
  public reservationInformation: {
    reservationNumber: string;
    departingAirport: string;
    destinationAirport: string;
  } | null = null;
  public isFlagged: boolean[] = new Array(this.MAXIMUM_CONNECTIONS).fill(false);
  public autocompleteInputArray: string[] = [];

  // Navigation methods: previous and next
  public onPrevious(prevCallback?: Function) {
    this.currentStep--;
    if (prevCallback) {
      prevCallback();
    }
  }

  // Function to check if the reservation form is valid (and go to the next step)
  public onNext(nextCallback?: Function) {
    if (this.reservationForm.valid) {
      this.reservationInformation = {
        reservationNumber: this.reservationForm.value.reservationNumber || '',
        departingAirport: this.reservationForm.value.departingAirport || '',
        destinationAirport: this.reservationForm.value.destinationAirport || '',
      };
      this.currentStep++;
      if (nextCallback) {
        nextCallback();
      }
    }
  }

  public addConnectionFlight(): void {
    if (this.airports.length < this.MAXIMUM_CONNECTIONS) {
      this.airports.push('');
    }
  }
}
