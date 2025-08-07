import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
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
import { TranslatePipe } from '@ngx-translate/core';

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

  public readonly disruptionReason = input<string>('');
  public readonly disruptionInfo = input<string>('');

  //state signals
  public readonly isLoading = signal<boolean>(true);
  public readonly errorMessage = signal<string | undefined>(undefined);
  public readonly isEligible = signal<boolean | null>(null);

  public readonly shouldShowLoading = computed(() => this.isLoading());

  public readonly shouldShowError = computed(() => !this.isLoading() && !!this.errorMessage());

  public readonly shouldShowResults = computed(
    () => !this.isLoading() && !this.errorMessage() && this.isEligible() !== null
  );

  public readonly shouldShowEligible = computed(
    () => this.shouldShowResults() && this.isEligible() === true
  );

  public readonly shouldNotShowEligible = computed(
    () => this.shouldShowResults() && this.isEligible() === false
  );

  public getErrorMessage(): string | undefined {
    return this.errorMessage() ?? undefined;
  }

  ngOnInit(): void {
    this.checkEligibility();
  }

  private checkEligibility(): void {
    this.isLoading.set(true);
    this.errorMessage.set(undefined);
    this.isEligible.set(null);

    try {
      const caseData = this.createCaseDTO();

      // Check if caseData is empty object (validation failed)
      if (!caseData || Object.keys(caseData).length === 0) {
        this.errorMessage.set('Missing case information. Please complete all previous steps.');
        this.isLoading.set(false);
        return;
      }

      this._caseService.checkEligibility(caseData as CaseDTO).subscribe({
        next: (isEligible: boolean) => {
          this.isEligible.set(isEligible);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.isEligible.set(false);
          this.isLoading.set(false);
          this.errorMessage.set(undefined);
        },
      });
    } catch (error) {
      this.errorMessage.set(undefined);
      this.isEligible.set(false);
      this.isLoading.set(false);
    }
  }

  // Navigation/action methods
  public onRetryCheck(): void {
    this.checkEligibility();
  }

  public onContinueToSubmission(nextCallback?: Function): void {
    // If eligible, proceed to submit the case
    if (this.isEligible()) {
      this._navigationService.nextStep();
      if (nextCallback) {
        nextCallback();
      }
    }
  }

  public onStartOver(): void {
    this._reservationService.resetReservation();
    this._flightService.resetAllData();
    this._navigationService.resetToFirstStep();

    this._router.navigate(['/form']).then(() => {
      window.location.reload();
    });
  }

  private createCaseDTO(): CaseDTO | {} {
    const reservationInfo = this._reservationService.getReservationInformation();
    const allFlights = this._flightService.getAllFlights();

    if (!reservationInfo.reservationNumber || !allFlights || allFlights.length === 0) {
      return {};
    }

    ///TODO: For now we have mock placeholder data, replace with new one after User Form is ready
    const caseData: CaseDTO = {
      status: Statuses.PENDING,
      disruptionReason: this.disruptionReason(),
      disruptionInfo: this.disruptionInfo(),
      date: new Date().toISOString(),
      clientID: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', ///TODO: Replace with actual client ID from user form
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
          isProblematic: flight.isFlagged,
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
