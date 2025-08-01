import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { StepperModule } from 'primeng/stepper';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ErrorMessageComponent } from '../error-message/error-message.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { FlightDetails, CaseFormComponent } from '../case-form/case-form.component';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
  FormsModule,
  FormArray,
} from '@angular/forms';

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
  private connectionFormData: { [key: string]: FlightDetails } = {};

  // Form for reservation details
  protected readonly reservationForm = this._formBuilder.group({
    reservationNumber: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6),
    ]),
    departingAirport: new FormControl<string>('', [
      Validators.pattern(/^[A-Z]{3}$/),
      Validators.minLength(3),
      Validators.maxLength(3),
      Validators.required,
    ]),
    destinationAirport: new FormControl<string>('', [
      Validators.pattern(/^[A-Z]{3}$/),
      Validators.minLength(3),
      Validators.maxLength(3),
      Validators.required,
    ]),
  });

  protected readonly airportFormArray = this._formBuilder.group({
    airports: this._formBuilder.array<string>([]),
  });

  public currentStep = 1;
  public isFlightFormValid = false;
  public flightData: FlightDetails | null = null;
  public airports: string[] = [];
  public reservationInformation: {
    reservationNumber: string;
    departingAirport: string;
    destinationAirport: string;
  } = {
    reservationNumber: '',
    departingAirport: '',
    destinationAirport: '',
  };
  public autocompleteInputArray: string[] = [];
  public isMainFlightValid = false;
  public connectionFlights: [string, string][] = [];
  public connectionFlightData: { [key: number]: FlightDetails | null } = {};

  // getter for the airports FormArray
  public get airportsArray(): FormArray<FormControl<string>> {
    return this.airportFormArray.get('airports') as FormArray<FormControl<string>>;
  }

  // Function for creating a connection
  public setConnectionStrings(airports: string[]): void {
    this.connectionFlights.push([this.reservationInformation?.departingAirport || '', airports[0]]);
    airports.forEach((airport, index) => {
      if (index < airports.length - 1) {
        this.connectionFlights.push([airport, airports[index + 1]]);
      }
    });
    this.connectionFlights.push([
      airports[airports.length - 1],
      this.reservationInformation.destinationAirport,
    ]);
  }

  // Getter for connection indices
  public get connectionIndices(): number[] {
    return Array.from({ length: this.connectionFlights.length }, (_, i) => i);
  }

  // Method to handle validity changes from connection flight forms
  public onConnectionFlightValidityChange(
    connectionIndex: number,
    isValid: boolean,
    data: FlightDetails | null
  ): void {
    // Store the data for this specific connection
    this.connectionFlightData[connectionIndex] = data;

    console.log(`Connection ${connectionIndex} validity:`, isValid, data);
  }

  // Method to get initial data for a connection form
  public getConnectionInitialData(connectionIndex: number): FlightDetails | null {
    return this.connectionFlightData[connectionIndex] || null;
  }

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
      const formValues = this.reservationForm.getRawValue();

      console.log('Reservation Information:', formValues);

      this.reservationInformation = {
        reservationNumber: formValues.reservationNumber || '',
        departingAirport: formValues.departingAirport || '',
        destinationAirport: formValues.destinationAirport || '',
      };

      this.currentStep++;
      if (nextCallback) {
        nextCallback();
      }
    }
  }

  // Function to handle the next step from flight details
  public onNextFromFlightDetails(nextCallback?: Function, mainFlightForm?: any): void {
    if (this.isMainFlightValid && this.isAirportsValid()) {
      this.currentStep++;
      if (this.airportsArray.length === 0) {
        this.currentStep++;
      } else {
        // Only create connections if they don't exist yet
        if (this.connectionFlights.length === 0) {
          this.setConnectionStrings(this.getAirportValues());
        }
      }

      if (nextCallback) {
        nextCallback();
      }
    }
  }

  // Method to handle navigation from connection flights step
  public onNextFromConnectionFlights(nextCallback?: Function): void {
    if (this.areAllConnectionFlightsValid()) {
      this.currentStep++;
      if (nextCallback) {
        nextCallback();
      }
    }
  }

  // Method to check if all connection flight forms are valid
  public areAllConnectionFlightsValid(): boolean {
    for (let i = 0; i < this.connectionFlights.length; i++) {
      if (!this.connectionFlightData[i]) {
        return false; // No data means form is not valid
      }
    }
    return true;
  }

  // Method to handle the validity change from the flight details form
  public get isNextButtonEnabled(): boolean {
    const airportsValid = this.isAirportsValid();
    const mainFlightValid = this.isMainFlightValid;
    return airportsValid && mainFlightValid;
  }

  // Function to add a connection flight airport
  public addConnectionFlight(): void {
    if (this.airports.length < this.MAXIMUM_CONNECTIONS) {
      const airportControl = this._formBuilder.control('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(3),
        Validators.pattern(/^[A-Z]{3}$/),
      ]);
      this.airportsArray.push(airportControl);
    }
  }

  // Function to remove a connection flight airport
  public removeConnectionFlight(index: number): void {
    if (index >= 0 && index < this.airportsArray.length) {
      this.airportsArray.removeAt(index);
    }
  }

  // Method to get all airport values
  public getAirportValues(): string[] {
    return this.airportsArray.value;
  }

  // Method to check if airports form is valid
  public isAirportsValid(): boolean {
    const valid = this.airportsArray.valid;
    return valid;
  }

  // Method to handle the validity change from the main flight form
  public onMainFlightValidityChange(isValid: boolean, data: FlightDetails | null): void {
    this.isMainFlightValid = isValid;
    this.flightData = data;
  }

  public onConnectionChange(index: number, event: any): void {
    const value = event.target?.value || event.query || '';
    this.airports[index] = value;
  }

  public onConnectionModelChange(index: number, value: string): void {
    this.airports[index] = value;
  }
}
