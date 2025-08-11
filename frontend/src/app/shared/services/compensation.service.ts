import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, of, Subject, switchMap } from 'rxjs';
import { NotificationService } from './toaster/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ApiError } from '../types/api-error';

type DistanceWrapper = {
  departureCode: string;
  destinationCode: string;
};

@Injectable({
  providedIn: 'root',
})
export class CompensationService {
  private _httpClient = inject(HttpClient);
  private _notificationService = inject(NotificationService);
  private _translationService = inject(TranslateService);

  private readonly URL = environment.API_URL + '/airports/compensation';

  private _calculateDistance = new Subject<DistanceWrapper>();

  public calculateDistance(departureCode: string, destinationCode: string) {
    this._calculateDistance.next({ destinationCode, departureCode });
  }

  public compensation$ = this._calculateDistance.pipe(
    switchMap((airportData) => {
      const endpoint =
        this.URL +
        '?departingAirportCode=' +
        airportData.departureCode +
        '&destinationAirportCode=' +
        airportData.destinationCode;

      return this._httpClient.post<number>(endpoint, {}).pipe(
        catchError((error) => {
          const apiError: ApiError = error?.error;
          const message = this._translationService.instant(apiError.detail, {
            departingAirportCode: airportData.departureCode,
            destinationAirportCode: airportData.destinationCode,
          });
          this._notificationService.showError(message);
          return of(null);
        })
      );
    })
  );
}
