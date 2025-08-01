import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {StepperModule} from 'primeng/stepper';
import {CardModule} from 'primeng/card';
import {FloatLabelModule} from 'primeng/floatlabel';
import {ErrorMessageComponent} from '../error-message/error-message.component';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {ButtonModule} from 'primeng/button';
import {Router} from '@angular/router';
import {FlightDetails, CaseFormComponent} from '../case-form/case-form.component';
import {InputTextModule} from 'primeng/inputtext';
import {MessageModule} from 'primeng/message';
import {ToggleSwitch} from 'primeng/toggleswitch';
import {FormsModule} from '@angular/forms';
import {Reservation} from '../../interfaces/reservation.interface';
import {Flight} from '../../interfaces/flight.interface';
import {Case} from '../../interfaces/case.interface';
import { Statuses } from '../../enums/status.enum';
import {DisruptionReason} from '../../enums/disruptionReason.enum';
import {Role} from '../../enums/role.enum';
import {CaseService} from '../../service/case.service';

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
    ToggleSwitch,
    FormsModule,
  ],
  templateUrl: './case-start.component.html',
  styleUrl: './case-start.component.scss',
})
export class CaseStartComponent {
  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _router = inject(Router);
  private readonly _caseService = inject(CaseService);

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
  public maxConnections = 4;
  public connectionIdCounter = 0;
  public connectionFlights: ({
    id: number;
    valid: boolean;
    data: FlightDetails | null;
    isFlagged: boolean | null;
  } | null)[] = new Array(this.maxConnections).fill(null);
  public connectionFlightsData: (FlightDetails | null)[] = new Array(this.maxConnections).fill(
    null
  );
  public isFlagged: boolean[] = new Array(this.maxConnections).fill(false);

  // Function to check if the connection flights are consecutive in form
  private areConnectionFlightsConsecutiveFromStart(): boolean {
    let consecutiveCount = 0;

    // Count consecutive flights from the beginning
    for (let i = 0; i < this.connectionFlights.length; i++) {
      if (this.connectionFlights[i] !== null) {
        consecutiveCount++;
      } else {
        break;
      }
    }

    // Check if remaining slots are all null
    for (let i = consecutiveCount; i < this.connectionFlights.length; i++) {
      if (this.connectionFlights[i] !== null) {
        return false; // Found a flight after a gap
      }
    }

    return true;
  }

  // Navigation methods: previous and next
  public onPrevious(prevCallback?: Function) {
    this.currentStep--;
    if (prevCallback) {
      prevCallback();
    }
  }

  public onNext(nextCallback?: Function) {
    if (this.reservationForm.valid) {
      this.currentStep++;
      if (nextCallback) {
        nextCallback();
      }
    }
  }

  public onNextFromFlightDetails(nextCallback?: Function, mainFlightForm?: any) {
    if (this.isMainFlightValid(mainFlightForm)) {
      this.flightData = mainFlightForm.getFormValue();
      this.currentStep++;
      if (nextCallback) {
        nextCallback();
      }
    }
  }

  public onNextFromConnectionFlights(nextCallback?: Function): void {
    if (this.areAllConnectionFlightsValid()) {
      this.currentStep++;
      if (nextCallback) {
        nextCallback();
      }
    }
  }

  // Checker for main flight validity
  public isMainFlightValid(mainFlightForm: any): boolean {
    return mainFlightForm?.flightDetailsForm?.valid || false;
  }

  // Function for the event of changing validity of main flight
  public onMainFlightValidityChange(isValid: boolean, data: FlightDetails | null): void {
    if (isValid && data) {
      this.flightData = data;
    }
  }

  // Function to add a new connection flight
  public addConnectionFlight(): void {
    const emptyIndex = this.connectionFlights.findIndex((flight) => flight === null);
    if (emptyIndex !== -1) {
      this.connectionFlights[emptyIndex] = {
        id: emptyIndex + 1,
        valid: !!this.connectionFlightsData[emptyIndex],
        data: this.connectionFlightsData[emptyIndex],
        isFlagged: this.isFlagged[emptyIndex],
      };
    }
  }

  // Checker for adding more connections
  public canAddMoreConnections(): boolean {
    return this.connectionFlights.some((flight) => flight === null);
  }

  // Function to remove a connection flight (inplace of the missing connections)
  public removeConnectionFlight(index: number): void {
    if (index >= 0 && index < this.connectionFlights.length) {
      this.connectionFlights[index] = null;
      this.connectionFlightsData[index] = null;
      this.isFlagged[index] = false;
    }
  }

  public areAllConnectionFlightsValid(): boolean {
    const activeFlights = this.connectionFlights.filter((flight) => flight !== null);

    if (activeFlights.length === 0) {
      return true;
    }

    // Check if connection flights are consecutive from start
    if (!this.areConnectionFlightsConsecutiveFromStart()) {
      return false;
    }

    // Check if all active flights are valid and have data
    return activeFlights.every((flight) => {
      if (!flight) return false;

      // Check if form is valid
      if (!flight.valid) return false;

      // Check if data exists and is complete
      if (!flight.data) return false;

      const data = flight.data;
      return !!(
        data.flightDate &&
        data.flightNumber?.trim() &&
        data.airline?.trim() &&
        data.departingAirport?.trim() &&
        data.destinationAirport?.trim() &&
        data.plannedDepartureTime &&
        data.plannedArrivalTime
      );
    });
  }

  // Function to handle validity change of connection flights
  public onConnectionFlightValidityChange(
    index: number,
    isValid: boolean,
    data: FlightDetails | null
  ): void {
    if (this.connectionFlights[index]) {
      this.connectionFlights[index].valid = isValid;
      this.connectionFlights[index].data = data;

      this.connectionFlightsData[index] = data;
    }
  }

  // Function to get active connection flights
  public getActiveConnectionFlights(): {
    id: number;
    valid: boolean;
    data: FlightDetails | null;
  }[] {
    return this.connectionFlights.filter(
      (
        flight
      ): flight is {
        id: number;
        valid: boolean;
        data: FlightDetails | null;
        isFlagged: boolean | null;
      } => flight !== null
    );
  }

  // Function for flagging the flights
  public flagFlight(index: number): void {
    if (index >= 0 && index < this.isFlagged.length) {
      if (this.connectionFlights[index]) {
        this.connectionFlights[index].isFlagged = this.isFlagged[index];
      }
    }
  }

  // Function to check if there are any flagged flights
  public canFlagAFlight(): boolean {
    return this.isFlagged.some((flag) => flag === true);
  }

  // Checking if the current flight can be flagged
  public canFlagFlight(index: number): boolean {
    return this.isFlagged[index] || !this.canFlagAFlight();
  }

  public onSubmit(): void {
  if (
    this.reservationForm.invalid ||
    !this.flightData ||
    !this.areAllConnectionFlightsValid()
  ) {
    alert('Form is invalid or incomplete');
    return;
  }

  // Create flights array from main flight and connection flights
  const flights: Flight[] = [];
  
  // Add main flight
  if (this.flightData) {
    flights.push({
      flightNumber: this.flightData.flightNumber,
      airLine: this.flightData.airline,
      departingAirport: this.flightData.departingAirport,
      destinationAirport: this.flightData.destinationAirport,
      departureTime: this.flightData.plannedDepartureTime || new Date(),
      arrivalTime: this.flightData.plannedArrivalTime || new Date(),
      flightDate: this.flightData.flightDate || new Date(),
      reservation: null,
      isProblematic: false,
    });
  }

  // Add connection flights
  const activeConnectionFlights = this.getActiveConnectionFlights();
  activeConnectionFlights.forEach((connectionFlight) => {
    if (connectionFlight.data) {
      flights.push({
        flightNumber: connectionFlight.data.flightNumber,
        airLine: connectionFlight.data.airline,
        departingAirport: connectionFlight.data.departingAirport,
        destinationAirport: connectionFlight.data.destinationAirport,
        departureTime: connectionFlight.data.plannedDepartureTime || new Date(),
        arrivalTime: connectionFlight.data.plannedArrivalTime || new Date(),
        flightDate: connectionFlight.data.flightDate || new Date(),
        reservation: null,
        isProblematic: false,
      });
    }
  });

  const caseDto: Case = {
    status: Statuses.PENDING,
    disruptionReason: DisruptionReason.ARRIVED_3H_LATE, // You can replace this with a form field
    disruptionInfo: 'Entered by user during manual case submission', // or bind from form
    date: new Date(), // or use selected date field if available

    reservation: {
      reservationNumber: this.reservationForm.value.reservationNumber ?? '',
      flights: flights,
      caseEntity: null,
    },

    client: {
      id: '00000000-0000-0000-0000-000000000001', // placeholder UUID — replace later
    } as any, // 👈 TypeScript will allow partial object this way

    assignedColleague: null,
    documentList: [],
  };

  // 1. Check eligibility
  this._caseService.checkEligibility(caseDto).subscribe((isEligible) => {
    if (!isEligible) {
      alert('Case is not eligible.');
      return;
    }

    // 2. Create case
    this._caseService.createCase(caseDto).subscribe({
      next: () => {
        alert('Case successfully created!');
        this._router.navigate(['/success']); // or another page
      },
      error: (err) => {
        console.error(err);
        alert('Failed to create case.');
      },
    });
  });
}
}
