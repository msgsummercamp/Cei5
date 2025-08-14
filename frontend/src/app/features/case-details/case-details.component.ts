import { Component, inject } from '@angular/core';
import { CaseService } from '../../shared/services/case.service';
import { Case } from '../../shared/types/case';
import { ActivatedRoute } from '@angular/router';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Statuses } from '../../shared/types/enums/status';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../shared/services/toaster/notification.service';

@Component({
  selector: 'app-case-details',
  imports: [ProgressSpinner],
  templateUrl: './case-details.component.html',
  styleUrl: './case-details.component.scss',
})
export class CaseDetailsComponent {
  private readonly _caseService = inject(CaseService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _translationService = inject(TranslateService);
  private readonly _notificationService = inject(NotificationService);

  public caseData: Case | null = null;
  public loading = true;

  ngOnInit() {
    const caseId = this._route.snapshot.paramMap.get('caseId');
    if (caseId) {
      this._caseService.getCaseById(caseId).subscribe({
        next: (data) => {
          this.caseData = data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    } else {
      this.loading = false;
    }
  }

  public getStatusTranslation(status: Statuses): string {
    return this._translationService.instant('statuses.' + status);
  }
}
