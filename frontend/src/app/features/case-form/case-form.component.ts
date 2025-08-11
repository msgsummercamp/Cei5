import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { StepperModule } from 'primeng/stepper';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import {
  FormArray,
  FormControl,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { FlightDetails, FlightFormComponent } from './views/flight-form/flight-form.component';
import { StepNavigationService } from '../../shared/services/step-navigation.service';
import {
  ReservationInformation,
  ReservationService,
} from '../../shared/services/reservation.service';
import { FlightManagementService } from '../../shared/services/flight-management.service';
import { AirportResponse, AirportsService } from '../../shared/services/airports.service';
import { ReservationDTO } from '../../shared/dto/reservation.dto';
import { CaseService } from '../../shared/services/case.service';
import {
  DisruptionFormComponent,
  DisruptionFormData,
} from './views/disruption-form/disruption-form.component';
import { EligibilityPageComponent } from './views/eligibility-page/eligibility-page.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CompensationService } from '../../shared/services/compensation.service';
import { UserRegistrationComponent } from './views/user-registration/user-registration.component';
import { UserService } from '../../shared/services/user.service';
import { departingAirportIsDestinationAirport } from '../../shared/validators/departingAirportIsDestinationAirport';
import { connectionsShouldBeDifferent } from '../../shared/validators/connectionsShouldBeDifferent';
import { EligibilityDataService } from '../../shared/services/eligibility-data.service';
import { ConfirmationFormComponent } from './views/confirmation-form/confirmation.component-form';
import { Statuses } from '../../shared/types/enums/status';
import { CaseDTO } from '../../shared/dto/case.dto';
import { CheckboxModule } from 'primeng/checkbox';
import { CaseFormUserData } from '../../shared/types/case-form-userdata';
import { NotificationService } from '../../shared/services/toaster/notification.service';

type DisruptionForm = {
  disruptionType: string;
  cancellationAnswer: string | null;
  delayAnswer: string | null;
  deniedBoardingAnswer: string | null;
  deniedBoardingFollowUpAnswer: string | null;
  airlineMotiveAnswer: string | null;
  airlineMotiveFollowUpAnswer: string | null;
  disruptionInformation: string;
};

@Component({
  selector: 'app-case-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    StepperModule,
    FloatLabelModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    ButtonModule,
    InputTextModule,
    FlightFormComponent,
    MessageModule,
    ErrorMessageComponent,
    FormsModule,
    TagModule,
    DisruptionFormComponent,
    EligibilityPageComponent,
    UserRegistrationComponent,
    TranslatePipe,
    ConfirmationFormComponent,
    CheckboxModule,
  ],
  templateUrl: './case-form.component.html',
  styleUrl: './case-form.component.scss',
  providers: [AirportsService],
})
export class CaseFormComponent implements OnInit {
  // CONSTANTS
  public readonly MAXIMUM_CONNECTIONS = 4;

  // Services injection
  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _caseService = inject(CaseService);
  private readonly _navigationService = inject(StepNavigationService);
  private readonly _reservationService = inject(ReservationService);
  private readonly _flightService = inject(FlightManagementService);
  private readonly _airportsService = inject(AirportsService);
  private readonly _userService = inject(UserService);
  private readonly _compensationService = inject(CompensationService);
  private readonly _eligibilityService = inject(EligibilityDataService);
  private readonly _notificationService = inject(NotificationService);
  private readonly _translateService = inject(TranslateService);

  private _lastUserRegistrationData?: CaseFormUserData;
  private _lastUser?: any;
  private _lastCompletedFor?: any;

  // Form for reservation details
  protected readonly reservationForm = this._formBuilder.group(
    {
      reservationNumber: new FormControl<string>('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
        Validators.pattern(/^[a-zA-Z0-9]+$/),
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
    },
    { validators: departingAirportIsDestinationAirport() }
  );

  protected readonly airportFormArray = this._formBuilder.group(
    {
      airports: this._formBuilder.array<string>([]),
    },
    { validators: connectionsShouldBeDifferent() }
  );

  public disruptionFormData: DisruptionFormData | null = null;
  public isMainFlightValid = false;
  public isDisruptionFormValid = false;
  public flightData: FlightDetails | null = null;
  public isUserRegistrationValid = false;
  public loggedInUserData = this._userService.userDetails;
  public userDetailsFormData: CaseFormUserData | null = null;
  public currentStep = toSignal(this._navigationService.currentStep$, { initialValue: 1 });
  public airportsSuggestion: AirportResponse[] = [];
  public airports = toSignal(this._airportsService.airports$, {
    initialValue: [] as AirportResponse[],
  });
  public compensation?: number | null;
  public readonly isUserReadOnly = this._userService.isUserReadOnly;

  public readonly departingAirportValue = toSignal(
    this.reservationForm.controls.departingAirport.valueChanges
  );
  public readonly destinationAirportValue = toSignal(
    this.reservationForm.controls.destinationAirport.valueChanges
  );
  public checked: boolean = false;

  constructor() {
    effect(() => {
      this.compensation = undefined;
      const dep = this.departingAirportValue();
      const dest = this.destinationAirportValue();
      if (!!dep && !!dest) {
        this._compensationService.calculateDistance(dep, dest);
      }
    });
  }

  public ngOnInit() {
    this._compensationService.compensation$.subscribe((data) => {
      this.compensation = data;
    });
  }

  public calculateCompensation() {
    const departingAirport = this.reservationForm.controls.departingAirport.value;
    const destinationAirport = this.reservationForm.controls.destinationAirport.value;
    if (!!departingAirport && !!destinationAirport) {
      this._compensationService.calculateDistance(departingAirport, destinationAirport);
    }
  }

  @ViewChild('disruptionForm') disruptionForm!: DisruptionFormComponent;

  public search(event: AutoCompleteCompleteEvent): void {
    const query = event.query;
    this.airportsSuggestion = [...this.airports()].filter(
      (airport) => !!airport.name && airport.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Getters
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
    if (this.checked && this.airportsArray.length === 0) {
      return false;
    }

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

  public get flagged(): boolean {
    return this._flightService.isAnyFlag();
  }

  public toggleFlag(index: number): void {
    this._flightService.toggleFlag(index);

    if (this.flightData) {
      this._flightService.updateConnectionTimesFromMainFlight(this.flightData);
    }
  }

  public isFlagActive(index: number): boolean {
    return this.isFlagged[index] === true;
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
    if (prevCallback) {
      prevCallback();
    }
  }

  public onPreviousFromEligibiltyCheck(prevCallback?: Function) {
    this._eligibilityService.resetEligibilityResult();
    this._navigationService.previousStep();
    if (prevCallback) {
      prevCallback();
    }
  }

  public onPreviousFromUserRegistration(prevCallback?: Function) {
    this._navigationService.previousStep();
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
    if (this.checked && this.airportsArray.length === 0) {
      return;
    }

    if (
      this.checked &&
      this.airportsArray.controls.some((control) => !control.value || control.value.trim() === '')
    ) {
      return;
    }

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

        this.updateConnectionsIfChanged(reservation);

        if (this.flightData) {
          this._flightService.updateConnectionTimesFromMainFlight(this.flightData);
        }
      }

      if (nextCallback) {
        nextCallback();
      }
    }
  }

  private updateConnectionsIfChanged(reservation: ReservationInformation): void {
    const currentAirports = this.getAirportValues();
    const existingConnections = this._flightService.getConnectionFlights();

    // Check if connections need to be updated
    const needsUpdate = this.doConnectionsNeedUpdate(
      existingConnections,
      currentAirports,
      reservation
    );

    if (needsUpdate) {
      // Reset and recreate connections
      this._flightService.resetConnectionData();
      this._flightService.setConnectionStrings(
        currentAirports,
        reservation.departingAirport,
        reservation.destinationAirport
      );
    }
  }

  private doConnectionsNeedUpdate(
    existingConnections: [string, string][],
    currentAirports: string[],
    reservation: ReservationInformation
  ): boolean {
    // If no existing connections, we need to create them
    if (existingConnections.length === 0) {
      return true;
    }

    // Calculate expected connections based on current airports
    const expectedConnections: [string, string][] = [];

    if (currentAirports.length > 0) {
      // First connection: departing -> first airport
      expectedConnections.push([reservation.departingAirport, currentAirports[0]]);

      // Intermediate connections
      for (let i = 0; i < currentAirports.length - 1; i++) {
        expectedConnections.push([currentAirports[i], currentAirports[i + 1]]);
      }

      // Final connection: last airport -> destination
      expectedConnections.push([
        currentAirports[currentAirports.length - 1],
        reservation.destinationAirport,
      ]);
    }

    // Compare existing vs expected
    if (existingConnections.length !== expectedConnections.length) {
      return true;
    }

    // Check if all connections match
    return !existingConnections.every(
      (conn, index) =>
        conn[0] === expectedConnections[index][0] && conn[1] === expectedConnections[index][1]
    );
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

  // Method to handle navigation from disruption info step
  public onNextFromDisruptionInfo(nextCallback?: Function): void {
    if (this.isDisruptionFormValid) {
      this._navigationService.nextStep();
      if (nextCallback) {
        nextCallback();
      }
    }
  }

  public onNextFromUserRegistration(nextCallback?: Function): void {
    if (this.isUserRegistrationValid) {
      this._navigationService.nextStep();
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
    if (!this.checked) {
      return true;
    }

    if (this.airportsArray.length === 0) {
      return false;
    }

    const hasEmptyAirports = this.airportsArray.controls.some(
      (control) => !control.value || control.value.trim() === ''
    );

    return this.airportsArray.valid && !hasEmptyAirports;
  }

  public onMainFlightValidityChange(isValid: boolean, data: FlightDetails | null): void {
    this.isMainFlightValid = isValid;
    this.flightData = data;

    if (data && this.airportsArray.length > 0) {
      this._flightService.updateConnectionTimesFromMainFlight(data);
    }
  }

  public onDisruptionFormValidityChange(
    event: { valid: boolean; data?: DisruptionFormData | null } | null
  ): void {
    this.isDisruptionFormValid = event?.valid ?? false;

    if (event?.data) {
      this.disruptionFormData = event.data; // This will now actually save the data!

      // Reset eligibility when disruption data changes
      if (this._eligibilityService) {
        this._eligibilityService.resetEligibilityResult();
      }
    }
  }

  public get disruptionInitialData(): DisruptionFormData | null {
    return this.disruptionFormData;
  }

  public get isEligibilityCheckValid(): boolean {
    const result = this._eligibilityService.eligibilityResult();
    return result.hasBeenChecked && result.isEligible === true;
  }

  public onUserRegistrationValidityChange(valid: boolean, data: CaseFormUserData | null): void {
    this.isUserRegistrationValid = valid;
    this.userDetailsFormData = data;
  }

  public get userRegistrationInitialData(): CaseFormUserData | undefined {
    const user = this.loggedInUserData();
    const completedFor = this.userDetailsFormData?.completedFor;

    if (user !== this._lastUser || completedFor !== this._lastCompletedFor) {
      this._lastUser = user;
      this._lastCompletedFor = completedFor;
      this._lastUserRegistrationData = user
        ? { completedBy: { ...user }, completedFor: completedFor ? { ...completedFor } : null }
        : this.userDetailsFormData
          ? { ...this.userDetailsFormData }
          : undefined;
    }
    return this._lastUserRegistrationData;
  }

  public areAllConnectionFlightsValid(): boolean {
    return this._flightService.areAllConnectionFlightsValid() && this.areAllDatesValid();
  }

  public submitCase(): void {
    if (!this._flightService.getAllFlights() || this._flightService.getAllFlights().length === 0) {
      return;
    }

    this._notificationService.showInfo(
      this._translateService.instant('case-form.submission-in-progress')
    );
    const clientID = this.getClientId();

    if (!clientID) {
      if (this.userDetailsFormData) {
        this._userService.createUser(this.userDetailsFormData.completedBy).subscribe({
          next: (createdUser) => {
            if (createdUser?.id) {
              if (this.userDetailsFormData) {
                this.userDetailsFormData.completedBy.id = createdUser?.id;
              }
            } else {
              this._notificationService.showInfo(
                'If you want to view all your cases you need to sign in.'
              );
            }
          },
          error: (error) => {
            this._notificationService.showError(error.error.detail);
          },
        });
      }
    }

    const flagStatus = this._flightService.getFlagStatus();
    this._flightService.getAllFlights().forEach((flight, index) => {
      if (index < flagStatus.length) {
        flight.isFlagged = flagStatus[index];
      }
    });

    if (clientID === null) {
      this._notificationService.showError(
        this._translateService.instant('auth-service.fetch-user-details-error')
      );
      return;
    }
    this._caseService.createAndSubmitCase(
      clientID,
      this.getDisruptionReason(),
      this.getDisruptionInfo(),
      this._caseService.createReservationDTO(),
      this.userDetailsFormData?.completedFor
    );
  }

  private getClientId(): string | null {
    const loggedInUser = this.loggedInUserData();
    const userDetails = this.userDetailsFormData?.completedBy;
    if (loggedInUser?.id) {
      return loggedInUser.id;
    }

    if (userDetails?.id) {
      return userDetails.id;
    }

    return null;
  }

  public resetAllFormData(): void {
    this.reservationForm.reset();

    while (this.airportsArray.length !== 0) {
      this.airportsArray.removeAt(0);
    }

    this.isMainFlightValid = false;
    this.isDisruptionFormValid = false;
    this.flightData = null;
    this.disruptionFormData = null;

    if (this.disruptionForm) {
      this.disruptionForm.resetForm();
    }

    this._eligibilityService.resetEligibilityResult();
    this._reservationService.resetReservation();
    this._flightService.resetAllData();
    this._navigationService.resetToFirstStep();
  }

  public getAirportDisplayName(code: string): string {
    if (!code) return '';

    const airport = this.airports().find((a) => a.code === code);
    return airport ? `${airport.name} (${airport.code})` : code;
  }

  public areAllDatesValid(): boolean {
    const flaggedIndex = this.isFlagged.findIndex((flag) => flag === true);

    if (flaggedIndex === -1) return false;

    const flaggedConnection = this._flightService.getConnectionInitialData(flaggedIndex);

    if (!flaggedConnection?.plannedArrivalTime || !flaggedConnection?.plannedDepartureTime) {
      return false;
    }

    return flaggedConnection.plannedArrivalTime > flaggedConnection.plannedDepartureTime;
  }

  public get isConnectionStepValid(): boolean {
    return this.flagged && this._flightService.areAllConnectionFlightsValid();
  }

  public getConnectionTitle(index: number): string {
    if (this.connectionFlights[index]) {
      return `${this.connectionFlights[index][0]} - ${this.connectionFlights[index][1]}`;
    }
    return '';
  }

  public onConnectionCheckboxChange(): void {
    if (!this.checked) {
      this.airportsArray.clear();
      this._flightService.resetConnectionData();
    }
  }

  public getConnectionValidationError(): string | null {
    if (!this.checked) {
      return null;
    }

    if (this.airportsArray.length === 0) {
      return this._translateService.instant('mainForm.pleaseAddConnection');
    }

    const hasEmptyAirports = this.airportsArray.controls.some(
      (control) => !control.value || control.value.trim() === ''
    );

    if (hasEmptyAirports) {
      return this._translateService.instant('mainForm.fillInAllConnections');
    }

    return null;
  }

  public getDisruptionReason(): string {
    if (this.disruptionFormData?.disruptionType) {
      if (this.disruptionFormData.disruptionType === 'Cancellation') {
        if (this.disruptionFormData.cancellationAnswer === '>14 days') {
          return 'CANCELATION_NOTICE_OVER_14_DAYS';
        } else if (this.disruptionFormData.cancellationAnswer === '<14 days') {
          return 'CANCELATION_NOTICE_UNDER_14_DAYS';
        }
        return 'CANCELATION_ON_DAY_OF_DEPARTURE';
      } else if (this.disruptionFormData.disruptionType === 'Delay') {
        if (this.disruptionFormData.delayAnswer === '>3 hours') {
          return 'ARRIVED_3H_LATE';
        } else if (this.disruptionFormData.delayAnswer === '<3 hours') {
          return 'ARRIVED_EARLY';
        }
        return 'NEVER_ARRIVED';
      } else if (this.disruptionFormData.disruptionType === 'Denied_Boarding') {
        if (this.disruptionFormData.deniedBoardingAnswer === 'No') {
          return 'DID_NOT_GIVE_THE_SEAT_VOLUNTARILY';
        }
        return 'DID_GIVE_THE_SEAT_VOLUNTARILY';
      }
    }

    if (this.disruptionForm && this.disruptionForm.getResponseForDisruption) {
      return this.disruptionForm.getResponseForDisruption();
    }

    return '';
  }

  public getDisruptionInfo(): string {
    if (this.disruptionFormData?.disruptionInformation) {
      return this.disruptionFormData.disruptionInformation;
    }

    if (this.disruptionForm && this.disruptionForm.getDisruptionDescription) {
      return this.disruptionForm.getDisruptionDescription();
    }

    return '';
  }
}
