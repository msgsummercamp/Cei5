import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, Subject, switchMap, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from './toaster/notification.service';
import { ApiError } from '../types/api-error';

type ContractDetails = {
  caseId: string;
  caseDate: string;
  firstName: string;
  lastName: string;
  address: string;
  postalCode: string;
  reservationNumber: string;
  email: string;
};

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  private _httpClient = inject(HttpClient);
  private readonly _notificationService = inject(NotificationService);
  private readonly _translationService = inject(TranslateService);

  private readonly URL = environment.API_URL + '/pdf/generate';

  private _generateContract = new Subject<string>();

  public generateContract(contract: string) {
    this._generateContract.next(contract);
  }

  public contract$ = this._generateContract.pipe(
    switchMap(() => {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      const endpoint = this.URL + '?template=contract';
      return this._httpClient.post<Blob>(
        endpoint,
        {
          //TODO: take this details from form and make it a type
          caseId: 'C-20250731-001',
          caseDate: '2025-07-31',
          firstName: 'Miruna',
          lastName: 'Popescu',
          address: 'Str. Plopilor, Cluj',
          postalCode: '567890',
          reservationNumber: 'RES-2025-1234',
          email: 'miruna.popescu@gmail.com',
        },
        { headers: headers, responseType: 'blob' as 'json' }
      );
    }),
    catchError((error) => {
      const apiError: ApiError = error?.error;
      this._notificationService.showError(this._translationService.instant(apiError.detail));
      return throwError(() => error);
    })
  );
}
