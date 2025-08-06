import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, Subject, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  private _httpClient = inject(HttpClient);
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
          caseId: 'C-20250731-001',
          contractDate: '2025-07-31',
          passengerName: 'Miruna Ionescu',
          passportNumber: 'RO987654321',
          passengerEmail: 'maria.ionescu@example.com',
          passengerPhone: '+40 712 345 678',
          reservationNumber: 'RES-2025-1234',
          travelDates: '2025-08-10 to 2025-08-20',
          destination: 'Bucharest, Romania',
        },
        { headers: headers }
      );
    }),
    catchError((error: Error) => {
      return throwError(() => error);
    })
  );
}
