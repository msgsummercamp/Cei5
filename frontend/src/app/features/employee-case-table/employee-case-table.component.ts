import { Component, inject, OnDestroy, OnInit, viewChild } from '@angular/core';
import { CaseService } from '../../shared/services/case.service';
import { Case } from '../../shared/types/case';
import { Table, TableModule } from 'primeng/table';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Statuses } from '../../shared/types/enums/status';
import { DisruptionReasons } from '../../shared/types/enums/disruption-reason';
import { User } from '../../shared/types/user';
import { Reservation } from '../../shared/types/reservation';
import { Document } from '../../shared/types/document';
import { Beneficiary } from '../../shared/types/beneficiary';
import { Button } from 'primeng/button';
import { ConfirmationService, SortEvent } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { NotificationService } from '../../shared/services/toaster/notification.service';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { Tag } from 'primeng/tag';
import { Subscription } from 'rxjs';
import { TableHelper } from '../../shared/helper/table-helper';
import { Router } from '@angular/router';
import { Card } from 'primeng/card';

export type CaseAux = {
  id: string;
  clientName: string;
  employeeName: string;
  problemFlightNumber: string;
  status: Statuses;
  disruptionReason: DisruptionReasons;
  disruptionInfo: string;
  date: Date | null;
  client: User;
  assignedColleague?: User | null;
  reservation: Reservation;
  documentList?: Document[];
  beneficiary?: Beneficiary | null;
};

@Component({
  selector: 'app-employee-case-table',
  imports: [TableModule, TranslatePipe, Button, ConfirmDialog, Select, FormsModule, Tag, Card],
  templateUrl: './employee-case-table.component.html',
  styleUrl: './employee-case-table.component.scss',
  providers: [ConfirmationService],
})
export class EmployeeCaseTableComponent implements OnInit, OnDestroy {
  private readonly _caseService = inject(CaseService);
  private readonly _confirmationService = inject(ConfirmationService);
  private readonly _translationService = inject(TranslateService);
  private readonly _notificationService = inject(NotificationService);
  private readonly _router = inject(Router);

  dt = viewChild.required<Table>('dt');

  public cases: CaseAux[] = [];
  public initialValue: CaseAux[] = [];
  public loading = true;
  private isSorted: boolean | null = null;
  public statusOptions: { label: string; value: Statuses }[] = [];
  private langChangeSub?: Subscription;
  public statusFilterValue: Statuses | null = null;

  ngOnInit() {
    this.buildStatusOptions();
    this.langChangeSub = this._translationService.onLangChange.subscribe(() => {
      this.buildStatusOptions();
    });
    this.initializeCases();
  }

  ngOnDestroy() {
    this.langChangeSub?.unsubscribe();
  }

  private buildStatusOptions(): void {
    this.statusOptions = Object.values(Statuses).map((status) => ({
      label: this.getStatusTranslation(status as Statuses),
      value: status,
    }));
  }

  private initializeCases(): void {
    this._caseService.getAllCases().subscribe((cases: Case[]) => {
      this.cases = cases.map((caseItem) => ({
        id: caseItem.id ?? '',
        clientName: this.extractClientName(caseItem),
        employeeName: this.extractEmployeeName(caseItem),
        problemFlightNumber: this.extractProblemFlightNumber(caseItem),
        status: caseItem.status ?? Statuses.VALID,
        disruptionReason: caseItem.disruptionReason,
        disruptionInfo: caseItem.disruptionInfo,
        date: caseItem.date,
        client: caseItem.client,
        assignedColleague: caseItem.assignedColleague,
        reservation: caseItem.reservation,
        documentList: caseItem.documentList,
        beneficiary: caseItem.beneficiary,
      }));
      this.initialValue = [...this.cases];
      this.loading = false;
    });
  }

  public extractProblemFlightNumber(caseItem: Case): string {
    const flights = caseItem.reservation.flights;
    for (const flight of flights) {
      if (flight.problematic) {
        return flight.flightNumber;
      }
    }
    return '';
  }

  public extractEmployeeName(caseItem: Case): string {
    return caseItem.assignedColleague
      ? `${caseItem.assignedColleague.firstName} ${caseItem.assignedColleague.lastName}`
      : '\u2014';
  }

  public extractClientName(caseItem: Case): string {
    return caseItem.client ? `${caseItem.client.firstName} ${caseItem.client.lastName}` : '\u2014';
  }

  public getStatusTranslation(status: Statuses): string {
    return this._translationService.instant('statuses.' + status);
  }

  public customSort(event: SortEvent) {
    if (this.isSorted == null) {
      this.isSorted = true;
      TableHelper.sortTableData(event);
    } else if (this.isSorted) {
      this.isSorted = false;
      TableHelper.sortTableData(event);
    } else if (!this.isSorted) {
      this.isSorted = null;
      this.cases = [...this.initialValue];
      this.dt().reset();
    }
  }

  public deleteCase(caseId: string): void {
    this._confirmationService.confirm({
      message: this._translationService.instant('case-table.confirm-delete'),
      acceptLabel: this._translationService.instant('yes'),
      rejectLabel: this._translationService.instant('no'),
      accept: () => {
        this._caseService.deleteCase(caseId).subscribe({
          next: () => {
            this.cases = this.cases.filter((caseItem) => caseItem.id !== caseId);
            this.initialValue = [...this.cases];
            this._notificationService.showSuccess(
              this._translationService.instant('case-table.case-deleted')
            );
          },
          error: (error) => {
            const apiError = error?.error;
            this._notificationService.showError(this._translationService.instant(apiError.detail));
          },
        });
      },
    });
  }

  public getStatusSeverity(status: Statuses): string {
    switch (status) {
      case Statuses.ARCHIVED:
        return 'secondary';
      case Statuses.COMPLETED:
        return 'success';
      case Statuses.VALID:
        return 'contrast';
      case Statuses.FAILED:
        return 'danger';
      case Statuses.INVALID:
        return 'warn';
      case Statuses.ASSIGNED:
        return 'info';
    }
  }

  public onStatusFilterClear(): void {
    this.statusFilterValue = null;
  }

  public navigateToCaseDetails(caseDetails: CaseAux): void {
    this._router.navigate(['case-details', caseDetails.id]);
  }
}
