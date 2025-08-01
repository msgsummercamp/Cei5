import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {Case} from '../interfaces/case.interface';




@Injectable({providedIn: 'root'})
export class CaseService {

  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = environment.apiUrl;


  createCase(caseData: Case): Observable<Case> {
    return this._http.post<Case>(this._apiUrl, caseData);
  }

  public checkEligibility(caseDTO: any): Observable<boolean> {
    return this._http.post<boolean>('/api/cases/check-eligibility', caseDTO);
  }
}
