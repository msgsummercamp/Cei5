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
import { CaseService } from '../../service/case.service';
import { CaseDTO } from '../../dto/case.dto';
import { UserDTO } from '../../dto/user.dto';
import { ReservationDTO } from '../../dto/reservation.dto';
import { DisruptionReason } from '../../enums/disruptionReason.enum';
import { Statuses } from '../../enums/status.enum';
import { Role } from '../../enums/role.enum';

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
  private readonly _caseService = inject(CaseService);

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
  //here are all flights including main flight and connections
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

  public onPreviousFromDisruptionInfo(prevCallback?: Function) {
    this.currentStep--;
    if (this.allFlights.length === 1) {
      this.currentStep--;
    }
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

  public submitCase(): void {
    // Add validation before submitting
    console.log('All flights data:', this.allFlights);
    console.log('Reservation info:', this.reservationInformation);

    if (!this.allFlights || this.allFlights.length === 0) {
      console.error('No flights to submit');
      return;
    }

    const caseData: CaseDTO = {
      status: Statuses.PENDING,
      disruptionReason: DisruptionReason.ARRIVED_3H_LATE,
      disruptionInfo: 'Flight was delayed by 3 hours',
      date: new Date().toISOString(), // This matches your DTO (string | null)
      ///TODO : replace with user data after user form is created
      clientID: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      assignedColleague: undefined,
      reservation: this.createReservationDTO(),
      documentList: [],
    };

    console.log('Case data to submit:', JSON.stringify(caseData, null, 2));

    this._caseService.checkEligibility(caseData).subscribe({
      next: (isEligible) => {
        console.log('Eligibility check result:', isEligible);
        if (isEligible) {
          this._caseService.createCase(caseData).subscribe({
            next: (response) => console.log('Case created successfully', response),
            error: (error) => {
              console.error('Error creating case', error);
              console.log('Full error object:', JSON.stringify(error, null, 2));
            }
          });
        } else {
          console.error('Client is not eligible for a case');
        }
      },
      error: (error) => {
        console.error('Error checking eligibility', error);
        console.log('Eligibility check error:', JSON.stringify(error, null, 2));
      }
    });
  }

  private createReservationDTO(): ReservationDTO {
    console.log('Creating reservation DTO with flights:', this.allFlights);
    
    return {
      reservationNumber: this.reservationInformation.reservationNumber,
      flights: this.allFlights.map((flight, index) => {
        const departureDateTime = flight.flightDetails.plannedDepartureTime || new Date();
        const arrivalDateTime = flight.flightDetails.plannedArrivalTime || new Date();

        const flightData = {
          flightDate: this.extractDateOnly(departureDateTime), // Convert to string (YYYY-MM-DD)
          flightNumber: flight.flightDetails.flightNumber || `FLIGHT${index + 1}`,
          departingAirport: flight.flightDetails.departingAirport || 'XXX',
          destinationAirport: flight.flightDetails.destinationAirport || 'YYY',
          departureTime: this.formatForLocalDateTime(departureDateTime), // Remove 'Z' for LocalDateTime
          arrivalTime: this.formatForLocalDateTime(arrivalDateTime), // Remove 'Z' for LocalDateTime
          airLine: flight.flightDetails.airline || 'UNKNOWN',
          isProblematic: flight.isFlagged
        };

        console.log(`Flight ${index + 1} data:`, flightData);
        return flightData;
      })
    };
  }

  // Helper method to format date for Java LocalDateTime (without timezone)
  private formatForLocalDateTime(date: Date): string {
    // Convert to ISO string and remove the 'Z' at the end
    return date.toISOString().slice(0, -1); // Removes the 'Z'
    // This converts "2025-08-01T08:59:42.000Z" to "2025-08-01T08:59:42.000"
  }

  // Helper method to extract date only (YYYY-MM-DD format)
  private extractDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
