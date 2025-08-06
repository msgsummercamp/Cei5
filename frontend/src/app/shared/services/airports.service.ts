import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, shareReplay, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationService } from './toaster/notification.service';

export type AirportResponse = {
  code: string;
  name: string;
  city: string;
  country: string;
};

@Injectable()
export class AirportsService {
  private _httpClient = inject(HttpClient);
  private _notificationService = inject(NotificationService);

  private readonly URL = environment.API_URL + '/airports/fetch';

  public airports$: Observable<AirportResponse[]> = of(true).pipe(
    switchMap(() => this._httpClient.get<AirportResponse[]>(this.URL)),
    map((ap) =>
      ap.map((airport) => ({
        ...airport,
        name: `${airport.name} (${airport.code})`,
      }))
    ),
    catchError((error: Error) => {
      this._notificationService.showError(error.message);
      return throwError(() => error);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );
}
