import { Component, computed, effect, inject, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CaseService } from '../../../../shared/services/case.service';
import { Router } from '@angular/router';
import { Statuses } from '../../../../shared/types/enums/status';
import { ReservationService } from '../../../../shared/services/reservation.service';
import { FlightManagementService } from '../../../../shared/services/flight-management.service';
import { CaseDTO } from '../../../../shared/dto/case.dto';
import { ReservationDTO } from '../../../../shared/dto/reservation.dto';
import { StepNavigationService } from '../../../../shared/services/step-navigation.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { EligibilityDataService } from '../../../../shared/services/eligibility-data.service';
import { UserService } from '../../../../shared/services/user.service';
import { CompensationService } from '../../../../shared/services/compensation.service';

@Component({
  selector: 'app-eligibility-page',
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule,
    TranslatePipe,
  ],
  templateUrl: './eligibility-page.component.html',
  styleUrl: './eligibility-page.component.scss',
})
export class EligibilityPageComponent implements OnInit {
  private readonly _caseService = inject(CaseService);
  private readonly _router = inject(Router);
  private readonly _reservationService = inject(ReservationService);
  private readonly _flightService = inject(FlightManagementService);
  private readonly _navigationService = inject(StepNavigationService);
  private readonly _eligibilityDataService = inject(EligibilityDataService);
  private readonly _userService = inject(UserService);
  private readonly _compensationService = inject(CompensationService);
  private readonly _translateService = inject(TranslateService);

  private hasRunInitialCheck = false;

  public readonly disruptionReason = input<string>('');
  public readonly disruptionInfo = input<string>('');

  // Update these to use the service
  public readonly eligibilityResult = this._eligibilityDataService.eligibilityResult;

  // Computed signals based on service data
  public readonly shouldShowLoading = computed(() => this.eligibilityResult().isLoading);
  public readonly shouldShowError = computed(
    () => !this.eligibilityResult().isLoading && !!this.eligibilityResult().errorMessage
  );
  public readonly shouldShowResults = computed(
    () =>
      !this.eligibilityResult().isLoading &&
      !this.eligibilityResult().errorMessage &&
      this.eligibilityResult().isEligible !== null
  );
  public readonly shouldShowEligible = computed(
    () => this.shouldShowResults() && this.eligibilityResult().isEligible === true
  );
  public readonly shouldNotShowEligible = computed(
    () => this.shouldShowResults() && this.eligibilityResult().isEligible === false
  );

  public compensation?: null | number;
  public readonly departingAirportValue =
    this._reservationService.getReservationInformation().departingAirport;
  public readonly destinationAirportValue =
    this._reservationService.getReservationInformation().destinationAirport;

  constructor() {
    this.compensation = undefined;
    const dep = this.departingAirportValue;
    const dest = this.destinationAirportValue;

    if (!!dep && !!dest) {
      this._compensationService.calculateDistance(dep, dest);
    }

    this._compensationService.compensation$.subscribe((data) => {
      this.compensation = data;
    });
  }

  public getEligibleMessage(): string {
    return (
      this._translateService.instant('eligibilityForm.eligible.compensation-start') +
      '\n' +
      this.compensation +
      '\n' +
      this._translateService.instant('eligibilityForm.eligible.compensation-end')
    );
  }

  public checkWhichEligibilityMotive(): boolean {
    if (
      this.disruptionReason() === 'ARRIVED_EARLY' ||
      this.disruptionReason() === 'CANCELATION_NOTICE_OVER_14_DAYS'
    ) {
      return true;
    }
    return false;
  }

  public getErrorMessage(): string | undefined {
    return this.eligibilityResult().errorMessage;
  }

  // Expose isEligible for parent component
  public isEligible(): boolean | null {
    return this.eligibilityResult().isEligible;
  }

  // Expose isLoading for parent component
  public isLoading(): boolean {
    return this.eligibilityResult().isLoading;
  }

  ngOnInit(): void {
    // Check if we already have a valid result
    if (this._eligibilityDataService.hasValidResult()) {
      this.hasRunInitialCheck = true;
      return; // Don't re-check, use cached result
    }

    // Only check if we have both inputs
    if (this.disruptionReason() && this.disruptionInfo()) {
      this.hasRunInitialCheck = true;
      this.checkEligibility();
    }
  }

  private checkEligibility(): void {
    // Prevent multiple simultaneous checks
    if (this.eligibilityResult().isLoading) {
      return;
    }

    // Update service state
    this._eligibilityDataService.setEligibilityResult({
      isLoading: true,
      errorMessage: undefined,
      isEligible: null,
    });

    try {
      const caseData = this.createCaseDTO();

      if (!caseData || Object.keys(caseData).length === 0) {
        this._eligibilityDataService.setEligibilityResult({
          isLoading: false,
          hasBeenChecked: true,
          isEligible: false,
        });
        return;
      }

      this._caseService.checkEligibility(caseData as CaseDTO).subscribe({
        next: (isEligible: boolean) => {
          this._eligibilityDataService.setEligibilityResult({
            isEligible: isEligible,
            isLoading: false,
            errorMessage: undefined,
            hasBeenChecked: true,
          });
        },
        error: (error) => {
          this._eligibilityDataService.setEligibilityResult({
            isEligible: false,
            isLoading: false,
            errorMessage: undefined,
            hasBeenChecked: true,
          });
        },
      });
    } catch (error) {
      this._eligibilityDataService.setEligibilityResult({
        isEligible: false,
        isLoading: false,
        errorMessage: undefined,
        hasBeenChecked: true,
      });
    }
  }

  // Navigation/action methods
  public onRetryCheck(): void {
    this._eligibilityDataService.resetEligibilityResult();
    this.checkEligibility();
  }

  public onContinueToSubmission(nextCallback?: Function): void {
    if (this.eligibilityResult().isEligible) {
      this._navigationService.nextStep();
      if (nextCallback) {
        nextCallback();
      }
    }
  }

  public onStartOver(): void {
    this._eligibilityDataService.resetEligibilityResult();
    this._reservationService.resetReservation();
    this._flightService.resetAllData();
    this._navigationService.resetToFirstStep();

    this._router.navigate(['/form']).then(() => {
      window.location.reload();
    });
  }

  private getClientId(): string | null {
    const userDetails = this._userService.userDetails();

    if (userDetails?.id) {
      return userDetails.id;
    }

    return null;
  }

  private createCaseDTO(): CaseDTO | {} {
    const reservationInfo = this._reservationService.getReservationInformation();
    const allFlights = this._flightService.getAllFlights();

    if (!reservationInfo.reservationNumber || !allFlights || allFlights.length === 0) {
      return {};
    }
    const clientID = this.getClientId();

    const caseData: CaseDTO = {
      status: Statuses.VALID,
      disruptionReason: this.disruptionReason(),
      disruptionInfo: this.disruptionInfo(),
      date: new Date().toISOString(),
      clientID: clientID || '',
      assignedColleague: undefined,
      reservation: this.createReservationDTO(),
      documentList: [],
    };

    return caseData;
  }

  private createReservationDTO(): ReservationDTO {
    return {
      reservationNumber: this._reservationService.getReservationInformation().reservationNumber,
      flights: this._flightService.getAllFlights().map((flight, index) => {
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
          problematic: flight.isFlagged,
        };
        return flightData;
      }),
    };
  }

  /**
   * Helper method to format date for Java LocalDateTime(without timezone).
   * @returns {Date} Returns "2025-08-01T08:59:42.000" instead of "2025-08-01T08:59:42.000Z"
   */
  private formatForLocalDateTime(date: Date): string {
    return date.toISOString().slice(0, -1);
  }

  /**
   * Helper method to extract date only (YYYY-MM-DD format).
   * @returns {Date} Returns the date in "YYYY-MM-DD" format.
   */
  private extractDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
