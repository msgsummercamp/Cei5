import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Step, StepperModule } from 'primeng/stepper';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ErrorMessageComponent } from '../error-message/error-message.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { FlightDetails, CaseFormComponent } from '../case-form/case-form.component';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { StepNavigationService } from '../../services/step-navigation.service';
import { ReservationInformation, ReservationService } from '../../services/reservation.service';
import { FlightManagementService } from '../../services/flight-management.service';
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
  // CONSTANTS
  public readonly MAXIMUM_CONNECTIONS = 4;

  // Services injection
  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _navigationService = inject(StepNavigationService);
  private readonly _reservationService = inject(ReservationService);
  private readonly _flightService = inject(FlightManagementService);

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

  public isMainFlightValid = false;
  public flightData: FlightDetails | null = null;

  // Getters
  public get currentStep(): number {
    return this._navigationService.getCurrentStep();
  }

  public get reservationInformation(): ReservationInformation {
    return this._reservationService.getReservationInformation();
  }

  public get connectionFlights(): [string, string][] {
    return this._flightService.getConnectionFlights();
  }

  public get connectionIndices(): number[] {
    return this._flightService.getConnectionIndices();
  }

  public get airportsArray(): FormArray<FormControl<string>> {
    return this.airportFormArray.get('airports') as FormArray<FormControl<string>>;
  }

  public get isNextButtonEnabled(): boolean {
    return this.isAirportsValid() && this.isMainFlightValid;
  }

  public get flags(): number {
    return this._flightService.getFlags();
  }

  public get isFlagged(): boolean[] {
    return this._flightService.getFlagStatus();
  }

  public get MAX_FLAGS(): number {
    return this._flightService.getMaxFlags();
  }

  public toggleFlag(index: number): void {
    this._flightService.toggleFlag(index);
  }

  public getConnectionInitialData(connectionIndex: number): FlightDetails | null {
    return this._flightService.getConnectionInitialData(connectionIndex);
  }

  public onConnectionFlightValidityChange(
    connectionIndex: number,
    isValid: boolean,
    data: FlightDetails | null
  ): void {
    this._flightService.updateConnectionFlightData(connectionIndex, data);
  }

  // Navigation methods: previous and next
  public onPrevious(prevCallback?: Function) {
    this._navigationService.previousStep();
    if (prevCallback) {
      prevCallback();
    }
  }

  public onPreviousFromDisruptionInfo(prevCallback?: Function) {
    const allFlights = this._flightService.getAllFlights();
    this._navigationService.goBackFromDisruptionInfo(allFlights.length);
    console.log(allFlights.length);
    if (prevCallback) {
      prevCallback();
    }
  }

  // Function to check if the reservation form is valid (and go to the next step)
  public onNext(nextCallback?: Function): void {
    if (this.reservationForm.valid) {
      const formValues = this.reservationForm.getRawValue();

      this._reservationService.setReservationInformation({
        reservationNumber: formValues.reservationNumber || '',
        departingAirport: formValues.departingAirport || '',
        destinationAirport: formValues.destinationAirport || '',
      });

      this._navigationService.nextStep();
      if (nextCallback) {
        nextCallback();
      }
    }
  }

  // Function to handle the next step from flight details
  public onNextFromFlightDetails(nextCallback?: Function, mainFlightForm?: any): void {
    if (this.isMainFlightValid && this.isAirportsValid()) {
      this._navigationService.nextStep();

      if (this.airportsArray.length === 0) {
        // Direct flight - skip connection step
        this._navigationService.nextStep();
        this._flightService.resetConnectionData();

        if (this.flightData) {
          this._flightService.resetAllData();
          const reservation = this._reservationService.getReservationInformation();
          const flightDetails: FlightDetails = {
            ...this.flightData,
            reservationNumber: reservation.reservationNumber,
            departingAirport: reservation.departingAirport,
            destinationAirport: reservation.destinationAirport,
          };
          this._flightService.addDirectFlight(flightDetails);
        }
      } else {
        // Connection flights
        const reservation = this._reservationService.getReservationInformation();
        this._flightService.resetConnectionData();
        this._flightService.setConnectionStrings(
          this.getAirportValues(),
          reservation.departingAirport,
          reservation.destinationAirport
        );
      }

      if (nextCallback) {
        nextCallback();
      }
    }
  }

  // Method to handle navigation from connection flights step
  public onNextFromConnectionFlights(nextCallback?: Function): void {
    if (this._flightService.areAllConnectionFlightsValid()) {
      this._navigationService.nextStep();

      const reservation = this._reservationService.getReservationInformation();
      this._flightService.createAllFlights(reservation.reservationNumber);

      if (nextCallback) {
        nextCallback();
      }
    }
  }

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

  public removeConnectionFlight(index: number): void {
    if (index >= 0 && index < this.airportsArray.length) {
      this.airportsArray.removeAt(index);

      if (this.airportsArray.length === 0) {
        this._flightService.resetConnectionData();
      }
    }
  }

  public getAirportValues(): string[] {
    return this.airportsArray.value;
  }

  public isAirportsValid(): boolean {
    return this.airportsArray.valid;
  }

  public onMainFlightValidityChange(isValid: boolean, data: FlightDetails | null): void {
    this.isMainFlightValid = isValid;
    this.flightData = data;
  }

  public areAllConnectionFlightsValid(): boolean {
    return this._flightService.areAllConnectionFlightsValid();
  }
}
