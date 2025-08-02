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
  public readonly MAX_FLAGS = 1;

  private readonly _formBuilder = inject(NonNullableFormBuilder);

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
  public allFlights: { flightDetails: FlightDetails; isFlagged: boolean }[] = [];
  public isFlagged: boolean[] = [];
  public flags = 0;

  public toggleFlag(index: number): void {
    this.flags = this.isFlagged[index] ? this.flags - 1 : this.flags + 1;
    this.isFlagged[index] = !this.isFlagged[index];
  }

  public createAllFlights(): void {
    this.allFlights = [];
    this.connectionFlights.forEach((connection, index) => {
      const flightDetails: FlightDetails = {
        flightNumber: this.connectionFlightData[index]?.flightNumber || '',
        airline: this.connectionFlightData[index]?.airline || '',
        reservationNumber: this.reservationInformation.reservationNumber,
        departingAirport: connection[0],
        destinationAirport: connection[1],
        plannedDepartureTime: this.connectionFlightData[index]?.plannedDepartureTime || null,
        plannedArrivalTime: this.connectionFlightData[index]?.plannedArrivalTime || null,
      };
      this.allFlights.push({ flightDetails, isFlagged: this.isFlagged[index] || false });
    });
  }

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
        const flightDetails: FlightDetails = {
          flightNumber: this.flightData?.flightNumber || '',
          airline: this.flightData?.airline || '',
          reservationNumber: this.reservationInformation.reservationNumber,
          departingAirport: this.reservationInformation.departingAirport,
          destinationAirport: this.reservationInformation.destinationAirport,
          plannedDepartureTime: this.flightData?.plannedDepartureTime || null,
          plannedArrivalTime: this.flightData?.plannedArrivalTime || null,
        };
        this.allFlights.push({ flightDetails, isFlagged: true });
      } else {
        this.connectionFlights = [];
        this.setConnectionStrings(this.getAirportValues());
        if (this.isFlagged.length === 0) {
          this.isFlagged = Array(this.connectionFlights.length).fill(false);
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

      this.createAllFlights();
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
    if (this.airportsArray.length < this.MAXIMUM_CONNECTIONS) {
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
}
