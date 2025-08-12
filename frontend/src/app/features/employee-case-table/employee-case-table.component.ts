import { Component, inject, OnInit, viewChild } from '@angular/core';
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

type CaseDTO = {
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
  imports: [TableModule, TranslatePipe, Button, ConfirmDialog, Select, FormsModule, Tag],
  templateUrl: './employee-case-table.component.html',
  styleUrl: './employee-case-table.component.scss',
  providers: [ConfirmationService],
})
export class EmployeeCaseTableComponent implements OnInit {
  private readonly _caseService = inject(CaseService);
  private readonly _confirmationService = inject(ConfirmationService);
  private readonly _translationService = inject(TranslateService);
  private readonly _notificationService = inject(NotificationService);

  dt = viewChild.required<Table>('dt');

  public cases: CaseDTO[] = [];
  public initialValue: CaseDTO[] = [];
  public loading = true;
  private isSorted: boolean | null = null;
  public statusOptions = Object.values(Statuses).map((status) => ({
    label: this.getStatusTranslation(status as Statuses),
    value: status,
  }));
  public statusFilterValue: Statuses | null = null;

  ngOnInit() {
    this.initializeCases();
  }

  private initializeCases(): void {
    this._caseService.getAllCases().subscribe((cases: Case[]) => {
      this.cases = cases.map((caseItem) => ({
        id: caseItem.id ?? '',
        clientName: this.extractClientName(caseItem),
        employeeName: this.extractEmployeeName(caseItem),
        problemFlightNumber: this.extractProblemFlightNumber(caseItem),
        status: caseItem.status ?? Statuses.PENDING,
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
      console.log('Cases loaded:', this.cases);
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
      : this._translationService.instant('case-table.unassigned');
  }

  public extractClientName(caseItem: Case): string {
    return caseItem.client ? `${caseItem.client.firstName} ${caseItem.client.lastName}` : '';
  }

  public getStatusTranslation(status: Statuses): string {
    return this._translationService.instant('statuses.' + status);
  }

  public customSort(event: SortEvent) {
    if (this.isSorted == null) {
      this.isSorted = true;
      this.sortTableData(event);
    } else if (this.isSorted) {
      this.isSorted = false;
      this.sortTableData(event);
    } else if (!this.isSorted) {
      this.isSorted = null;
      this.cases = [...this.initialValue];
      this.dt().reset();
    }
  }

  public sortTableData(event: SortEvent) {
    const field = event.field;
    const order = event.order;
    if (!field || !order) {
      console.error('Sort event does not have a valid field or order');
      return;
    }
    event.data?.sort((data1: CaseDTO, data2: CaseDTO) => {
      let value1 = data1[field as keyof CaseDTO] || '';
      let value2 = data2[field as keyof CaseDTO] || '';
      let result;
      if (!value1 && !value2) result = 0;
      else if (!value1 && !!value2) result = -1;
      else if (!!value1 && !value2) result = 1;
      else if (typeof value1 === 'string' && typeof value2 === 'string')
        result = value1.localeCompare(value2);
      else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

      return order * result;
    });
  }

  public deleteCase(caseId: string): void {
    this._confirmationService.confirm({
      message: this._translationService.instant('case-table.confirm-delete'),
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
      case Statuses.PENDING:
        return 'info';
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
    }
  }

  public onStatusFilterClear(): void {
    this.statusFilterValue = null;
  }
}
