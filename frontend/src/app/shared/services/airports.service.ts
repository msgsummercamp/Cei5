import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationService } from './toaster/notification.service';
import { ApiError } from '../types/api-error';
import { TranslateService } from '@ngx-translate/core';

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
  private _translationService = inject(TranslateService);

  private readonly URL = environment.API_URL + '/airports/fetch';

  public airports$: Observable<AirportResponse[]> = of(true).pipe(
    switchMap(() => this._httpClient.get<AirportResponse[]>(this.URL)),
    map((ap) =>
      ap.map((airport) => ({
        ...airport,
        name: `${airport.name} (${airport.code})`,
      }))
    ),
    catchError((error) => {
      const apiError: ApiError = error?.error;
      let message: string;

      if (apiError) {
        message = this._translationService.instant(apiError.detail);
      } else {
        message = this._translationService.instant('api-errors.generic-server-error');
      }
      this._notificationService.showError(message);
      return of([]);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );
}
