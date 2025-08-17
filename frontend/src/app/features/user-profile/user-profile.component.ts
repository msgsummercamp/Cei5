import { Component, inject, OnDestroy, OnInit, viewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { Case } from '../../shared/types/case';
import { CaseService } from '../../shared/services/case.service';
import { UserService } from '../../shared/services/user.service';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Flight } from '../../shared/types/flight';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Card } from 'primeng/card';
import { User } from '../../shared/types/user';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Statuses } from '../../shared/types/enums/status';
import { Subscription } from 'rxjs';
import { ConfirmationService, SortEvent } from 'primeng/api';
import { TableHelper } from '../../shared/helper/table-helper';
import { DisruptionReasons } from '../../shared/types/enums/disruption-reason';
import { Reservation } from '../../shared/types/reservation';
import { Document } from '../../shared/types/document';
import { Beneficiary } from '../../shared/types/beneficiary';
import { Router } from '@angular/router';
import { StepNavigationService } from '../../shared/services/step-navigation.service';

type CaseDTO = {
  id: string;
  beneficiaryName: string;
  employeeName: string;
  flightNumber: string;
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
  selector: 'app-user-cases-table',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
  imports: [
    TableModule,
    CommonModule,
    TranslatePipe,
    Card,
    FormsModule,
    Select,
    Tag,
    Button,
    ConfirmDialog,
    NgOptimizedImage,
  ],
  providers: [ConfirmationService],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  private readonly _caseService = inject(CaseService);
  private readonly _userService = inject(UserService);
  public readonly user: User | undefined = this._userService.userDetails();
  private readonly _translationService = inject(TranslateService);
  private readonly _stepNavigationService = inject(StepNavigationService);
  private readonly router = inject(Router);

  private langChangeSub?: Subscription;
  private isSorted: boolean | null = null;
  public loading = true;
  public statusFilterValue: Statuses | null = null;
  public statusOptions: { label: string; value: Statuses }[] = [];
  public userCases: CaseDTO[] = [];
  public initialValue: CaseDTO[] = [];

  dt = viewChild.required<Table>('dt');

  ngOnInit() {
    this.buildStatusOptions();
    this.langChangeSub = this._translationService.onLangChange.subscribe(() => {
      this.buildStatusOptions();
    });
    this.initializeCases(this.getUserId());
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

  private initializeCases(userId: string) {
    this._caseService.getAllUserCases(userId).subscribe((data: Case[]) => {
      this.userCases = data.map((caseItem) => ({
        id: caseItem.id ?? '',
        beneficiaryName: this.getBeneficiaryName(caseItem),
        flightNumber: this.getProblematicFlightNumber(caseItem),
        employeeName: this.getEmployeeName(caseItem),
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
      this.initialValue = [...this.userCases];
      this.loading = false;
    });
  }

  public getUserFullName(): string {
    if (this.user) {
      return `${this.user.lastName} ${this.user.firstName}`;
    }
    return '';
  }

  private getUserId(): string {
    if (this.user) {
      return this.user.id || '';
    } else {
      return '';
    }
  }

  public getProblematicFlight(givenCase: Case): Flight | undefined {
    if (givenCase.reservation.flights.length === 1) {
      return givenCase.reservation.flights[0];
    } else {
      return givenCase.reservation.flights.find((flight) => flight.problematic);
    }
  }

  public getProblematicFlightNumber(givenCase: Case): string {
    return this.getProblematicFlight(givenCase)?.flightNumber ?? '';
  }

  public mergeFirstAndLastName(givenCase: Case): string {
    return `${givenCase.client.lastName} ${givenCase.client.firstName}`;
  }

  public getBeneficiaryName(givenCase: Case): string {
    const beneficiary = givenCase.beneficiary;
    if (beneficiary) {
      return `${beneficiary.lastName} ${beneficiary.firstName}`;
    }
    return this.mergeFirstAndLastName(givenCase);
  }

  public getEmployeeName(caseItem: Case): string {
    return caseItem.assignedColleague
      ? `${caseItem.assignedColleague.firstName} ${caseItem.assignedColleague.lastName}`
      : '\u2014';
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
      this.userCases = [...this.initialValue];
      this.dt().reset();
    }
  }

  public getStatusTranslation(status: Statuses): string {
    return this._translationService.instant('statuses.' + status);
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

  public redirectToCaseForm(): void {
    this._stepNavigationService.resetToFirstStep();
    this.router.navigate(['/form']);
  }
}
