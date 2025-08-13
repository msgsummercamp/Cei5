import { Component, inject } from '@angular/core';
import { CaseService } from '../../shared/services/case.service';
import { Case } from '../../shared/types/case';
import { ActivatedRoute } from '@angular/router';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-case-details',
  imports: [JsonPipe],
  templateUrl: './case-details.component.html',
  styleUrl: './case-details.component.scss',
})
export class CaseDetailsComponent {
  private readonly _caseService = inject(CaseService);
  private readonly _route = inject(ActivatedRoute);

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
}
