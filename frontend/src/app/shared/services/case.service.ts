import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Case } from '../types/case';
import { CaseDTO } from '../dto/case.dto';
import { NotificationService } from './toaster/notification.service';

@Injectable({ providedIn: 'root' })
export class CaseService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = environment.API_URL;
  private readonly _notificationService = inject(NotificationService);

  public createCase(caseData: CaseDTO): void{
      this._http.post<Case>(`${this._apiUrl}/cases`, caseData).subscribe({
        next: (createdCase) => {
          this._notificationService.showSuccess('Case created successfully');

        },
        error: (error) => {
          this._notificationService.showError(error.error.detail);
        }
      });
      

  }

  public checkEligibility(caseDTO: CaseDTO): Observable<boolean> {
    return this._http.post<boolean>(`${this._apiUrl}/cases/check-eligibility`, caseDTO);
  }
}
