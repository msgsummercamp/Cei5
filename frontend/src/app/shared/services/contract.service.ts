import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, Subject, switchMap, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from './toaster/notification.service';
import { ApiError } from '../types/api-error';
import { ReservationService } from './reservation.service';
import { CaseService } from './case.service';
import { UserDetailsService } from './user-details.service';

type ContractDetails = {
  caseId?: string;
  caseDate?: Date | null;
  firstName?: string;
  lastName?: string;
  address?: string;
  postalCode?: string;
  reservationNumber: string;
  email?: string;
};

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  private _httpClient = inject(HttpClient);
  private readonly _notificationService = inject(NotificationService);
  private readonly _translationService = inject(TranslateService);
  private readonly _reservationService = inject(ReservationService);
  private readonly _userSevice = inject(UserDetailsService);
  private readonly _caseService = inject(CaseService);

  private readonly URL = environment.API_URL + '/pdf/generate';

  private _generateContract = new Subject<string>();

  private contractDetails: ContractDetails = {
    caseId: this._caseService.getCaseId(),
    caseDate: this._caseService.getCaseDate(),
    firstName: this._userSevice.getUserDetails().firstName,
    lastName: this._userSevice.getUserDetails().lastName,
    address: this._userSevice.getUserDetails().userDetails?.address,
    postalCode: this._userSevice.getUserDetails().userDetails?.postalCode,
    reservationNumber: this._reservationService.getReservationInformation().reservationNumber,
    email: this._userSevice.getEmail(),
  };

  public generateContract(contract: string) {
    this._generateContract.next(contract);
  }

  public contract$ = this._generateContract.pipe(
    switchMap(() => {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      const endpoint = this.URL + '?template=contract';
      return this._httpClient.post<Blob>(endpoint, this.contractDetails, {
        headers: headers,
        responseType: 'blob' as 'json',
      });
    }),
    catchError((error) => {
      const apiError: ApiError = error?.error;
      this._notificationService.showError(this._translationService.instant(apiError.detail));
      return throwError(() => error);
    })
  );
}
