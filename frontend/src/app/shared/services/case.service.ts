import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Case } from '../types/case';
import { CaseDTO } from '../dto/case.dto';

@Injectable({ providedIn: 'root' })
export class CaseService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = environment.API_URL;

  public createCase(caseData: CaseDTO): Observable<Case> {
    return this._http.post<Case>(`${this._apiUrl}/cases`, caseData);
  }

  public checkEligibility(caseDTO: CaseDTO): Observable<boolean> {
    return this._http.post<boolean>(`${this._apiUrl}/cases/check-eligibility`, caseDTO);
  }
}
