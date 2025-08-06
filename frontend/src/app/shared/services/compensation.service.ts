import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, Subject, switchMap, throwError } from 'rxjs';

type DistanceWrapper = {
  departureCode: string;
  destinationCode: string;
};

@Injectable({
  providedIn: 'root',
})
export class CompensationService {
  private _httpClient = inject(HttpClient);
  private readonly URL = environment.API_URL + '/airports/compensation';

  private _calculateDistance = new Subject<DistanceWrapper>();

  public calculateDistance(departureCode: string, destinationCode: string) {
    this._calculateDistance.next({ destinationCode, departureCode });
  }

  public compensation$ = this._calculateDistance.pipe(
    switchMap((obj) => {
      const endpoint =
        this.URL +
        '?departingAirportCode=' +
        obj.departureCode +
        '&destinationAirportCode=' +
        obj.destinationCode;

      return this._httpClient.post<number>(endpoint, {});
    }),
    catchError((error: Error) => {
      return throwError(() => error);
    })
  );
}
