import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, shareReplay, Subject, switchMap, throwError } from 'rxjs';

export type AirportResponse = {
  code: string;
  name: string;
  city: string;
  country: string;
};

@Injectable()
export class AirportsService {
  private _httpClient = inject(HttpClient);

  //TODO extract
  private readonly URL = 'http://localhost:8080/api/airports/fetch';

  public airports$: Observable<AirportResponse[]> = of(true).pipe(
    switchMap(() => this._httpClient.get<AirportResponse[]>(this.URL)),
    map((ap) =>
      ap.map((airport) => ({
        ...airport,
        name: `${airport.name} (${airport.code})`,
      }))
    ),
    catchError((error: Error) => {
      //TODO replace with toaster
      console.error(error.message);
      return throwError(() => error);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );
}
