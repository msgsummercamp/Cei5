import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Case } from '../types/case';
import { CaseDTO } from '../dto/case.dto';
import { NotificationService } from './toaster/notification.service';
import { FlightManagementService } from './flight-management.service';
import { Statuses } from '../types/enums/status';
import { ReservationDTO } from '../dto/reservation.dto';
import { ReservationService } from './reservation.service';
import { Beneficiary } from '../types/beneficiary';
import { TranslateService } from '@ngx-translate/core';
import { ApiError } from '../types/api-error';
import { Document } from '../types/document';
import { MimeTypeMapper } from '../helper/mime-type-mappings';

type CreatedCaseDetails = {
  caseId?: string;
  caseDate: Date | null;
};

@Injectable({ providedIn: 'root' })
export class CaseService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = environment.API_URL;
  private readonly _notificationService = inject(NotificationService);
  private readonly _flightService = inject(FlightManagementService);
  private readonly _reservationService = inject(ReservationService);
  private readonly _translationService = inject(TranslateService);
  public readonly caseSaved = new Subject<CreatedCaseDetails>();

  public createCase(caseData: CaseDTO): void {
    console.log(caseData);
    this._http.post<Case>(`${this._apiUrl}/cases`, caseData).subscribe({
      next: (createdCase) => {
        this.caseSaved.next({
          caseId: createdCase.id,
          caseDate: createdCase.date,
        });
        this._notificationService.showSuccess('Case created successfully');
      },
      error: (error) => {
        const apiError: ApiError = error?.error;
        this._notificationService.showError(this._translationService.instant(apiError.detail));
      },
    });
  }

  public getAllUserCases(clientID: string): Observable<Case[]> {
    return this._http.get<Case[]>(`${this._apiUrl}/cases/user/${clientID}`).pipe(
      catchError((error) => {
        const apiError: ApiError = error?.error;
        this._notificationService.showError(this._translationService.instant(apiError.detail));
        return of([]);
      })
    );
  }

  public checkEligibility(caseDTO: CaseDTO): Observable<boolean> {
    return this._http.post<boolean>(`${this._apiUrl}/cases/check-eligibility`, caseDTO);
  }

  public createAndSubmitCase(
    clientID: string,
    disruptionReason: string,
    disruptionInfo: string,
    reservationDTO: ReservationDTO,
    beneficiary?: Beneficiary | null
  ): void {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    const caseData: CaseDTO = {
      status: Statuses.VALID,
      disruptionReason: disruptionReason,
      disruptionInfo: disruptionInfo,
      date: formattedDate,
      clientID: clientID,
      assignedColleague: undefined,
      reservation: reservationDTO,
      documentList: [],
      beneficiary: beneficiary,
    };

    this.checkEligibility(caseData).subscribe({
      next: (isEligible) => {
        if (isEligible) {
          this.createCase(caseData);
        } else {
          this._notificationService.showError('You are not eligible for compensation');
        }
      },
      error: (error) => {
        this._notificationService.showError(error.error.detail);
      },
    });
  }

  public createReservationDTO(): ReservationDTO {
    return {
      reservationNumber: this._reservationService.getReservationInformation().reservationNumber,
      flights: this._flightService.getAllFlights().map((flight, index) => {
        const departureDateTime = flight.flightDetails.plannedDepartureTime || new Date();
        const arrivalDateTime = flight.flightDetails.plannedArrivalTime || new Date();

        return {
          flightDate: this.extractDateOnly(departureDateTime) || null,
          flightNumber: flight.flightDetails.flightNumber || null,
          departingAirport: flight.flightDetails.departingAirport || 'XXX',
          destinationAirport: flight.flightDetails.destinationAirport || 'YYY',
          departureTime: this.formatForLocalDateTime(departureDateTime) || null,
          arrivalTime: this.formatForLocalDateTime(arrivalDateTime) || null,
          airLine: flight.flightDetails.airline || null,
          problematic: flight.isFlagged,
        };
      }),
    };
  }

  public getAllCases(): Observable<Case[]> {
    return this._http.get<Case[]>(`${this._apiUrl}/cases`).pipe(
      catchError((error) => {
        const apiError: ApiError = error?.error;
        this._notificationService.showError(this._translationService.instant(apiError.detail));
        return of([]);
      })
    );
  }

  public deleteCase(caseId: string): Observable<void> {
    return this._http.delete<void>(`${this._apiUrl}/cases/${caseId}`).pipe(
      catchError((error) => {
        const apiError: ApiError = error?.error;
        this._notificationService.showError(this._translationService.instant(apiError.detail));
        return of();
      })
    );
  }

  public getCaseById(caseId: string): Observable<Case | null> {
    return this._http.get<Case>(`${this._apiUrl}/cases/${caseId}`).pipe(
      catchError((error) => {
        const apiError: ApiError = error?.error;
        this._notificationService.showError(this._translationService.instant(apiError.detail));
        return of(null);
      })
    );
  }

  public getDocument(documentId: string): Observable<Document> {
    return this._http.get<Document>(`${this._apiUrl}/documents/${documentId}`).pipe(
      catchError((error) => {
        const apiError: ApiError = error?.error;
        this._notificationService.showError(this._translationService.instant(apiError.detail));
        return of(null as any);
      })
    );
  }

  public getDocumentList(caseId: string): Observable<Document[]> {
    return this._http.get<Document[]>(`${this._apiUrl}/documents/case/${caseId}`).pipe(
      catchError((error) => {
        const apiError: ApiError = error?.error;
        this._notificationService.showError(this._translationService.instant(apiError.detail));
        return of([]);
      })
    );
  }

  public uploadDocument(
    caseId: string,
    file: File,
    name: string,
    type: string
  ): Observable<Document> {
    let backendType = MimeTypeMapper.mapMimeTypeToDocumentType(type);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('type', backendType);
    console.log('Uploading document:');

    return this._http
      .post<Document>(`${this._apiUrl}/documents/case/${caseId}/upload`, formData)
      .pipe(
        catchError((error) => {
          const apiError: ApiError = error?.error;
          this._notificationService.showError(this._translationService.instant(apiError.detail));
          return of(null as any);
        })
      );
  }

  private extractDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Helper method to format date for Java LocalDateTime (without timezone)
  private formatForLocalDateTime(date: Date): string {
    return date.toISOString().slice(0, -1); // Removes the 'Z'
  }
}
