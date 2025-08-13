import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, combineLatest, shareReplay, Subject, switchMap, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from './toaster/notification.service';
import { ApiError } from '../types/api-error';
import { CaseService } from './case.service';
import { CaseFormUserDetailsService } from './case-form-user-details.service';
import { Beneficiary } from '../types/beneficiary';
import { User } from '../types/user';
import { ReservationService } from './reservation.service';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  private _httpClient = inject(HttpClient);
  private readonly _notificationService = inject(NotificationService);
  private readonly _translationService = inject(TranslateService);
  private readonly _caseService = inject(CaseService);
  private readonly _caseFormUserDetailsService = inject(CaseFormUserDetailsService);
  private readonly _reservationService = inject(ReservationService);

  // private readonly firstName = computed(() => this._userRegistrationForm.userFirstName());
  // private readonly lastName = computed(() => this._userRegistrationForm.userLastName());
  // private readonly reservationNumber = computed(() => this._reservationForm.reservationNumber());

  private readonly caseFormUserDetails = this._caseFormUserDetailsService.contractUserDetails;

  // private readonly reservationDetails = signal<number | undefined>(this._reservationService.)
  private readonly URL = environment.API_URL + '/pdf/generate';

  private _generateContract = new Subject<string>();

  public generateContract(contract: string) {
    this._generateContract.next(contract);
  }

  public contract$ = this._generateContract.pipe(
    switchMap(() => this._caseService.caseSaved),
    switchMap((caseDetails) => {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      const endpoint = this.URL + '?template=contract';
      return this._httpClient.post<Blob>(
        endpoint,
        {
          caseId: caseDetails.caseId,
          caseDate: caseDetails.caseDate,
          firstName: this.caseFormUserDetails()?.firstName,
          lastName: this.caseFormUserDetails()?.lastName,
          reservationNumber: this._reservationService.getReservationInformation().reservationNumber,
        },
        {
          headers: headers,
          responseType: 'blob' as 'json',
        }
      );
    }),
    catchError((error) => {
      const apiError: ApiError = error?.error;
      this._notificationService.showError(this._translationService.instant(apiError.detail));
      return throwError(() => error);
    })
  );
}
