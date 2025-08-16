import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { User } from '../../shared/types/user';
import { UserService } from '../../shared/services/user.service';
import { NotificationService } from '../../shared/services/toaster/notification.service';
import { ApiError } from '../../shared/types/api-error';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { CaseService } from '../../shared/services/case.service';
import { map, Subscription, switchMap } from 'rxjs';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { EmployeeDialogComponent } from '../../shared/employee-dialog/employee-dialog.component';
import { ConfirmationService, SortEvent } from 'primeng/api';
import { TableHelper } from '../../shared/helper/table-helper';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { Roles } from '../../shared/types/enums/roles';
import { FormsModule } from '@angular/forms';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  selector: 'app-admin-table',
  imports: [
    TableModule,
    CommonModule,
    TranslatePipe,
    InputIconModule,
    InputTextModule,
    IconFieldModule,
    ButtonModule,
    EmployeeDialogComponent,
    Select,
    Tag,
    FormsModule,
    ConfirmDialog,
  ],
  templateUrl: './admin-table.component.html',
  styleUrl: './admin-table.component.scss',
  providers: [ConfirmationService],
})
export class AdminTableComponent implements OnInit {
  private readonly _userService = inject(UserService);
  private readonly _caseService = inject(CaseService);
  private readonly _notificationService = inject(NotificationService);
  private readonly _translateService = inject(TranslateService);
  private readonly _confirmationService = inject(ConfirmationService);

  public users: User[] = [];
  public initialValue: User[] = [];
  public userCaseCounts = new Map<string, number>();
  public loading = true;
  private isSorted: boolean | null = null;
  public rolesFilterValue: Roles | null = null;
  public rolesOptions: { label: string; value: Roles }[] = [];
  private langChangeSub?: Subscription;

  public showEmployeeDialog = signal(false);
  dt = viewChild.required<Table>('dt');

  ngOnInit(): void {
    this.buildRoleOptions();
    this.langChangeSub = this._translateService.onLangChange.subscribe(() => {
      this.buildRoleOptions();
    });
    this.loadUsers();
  }

  private buildRoleOptions(): void {
    this.rolesOptions = Object.values(Roles).map((role) => ({
      label: this.getRoleTranslation(role as Roles),
      value: role,
    }));
  }

  public concatenateName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  public getCaseCountForUser(userId: string): number {
    return this.userCaseCounts.get(userId) || 0;
  }

  public deleteUser(userId: string): void {
    if (userId === this._userService.userDetails()?.id) {
      this._notificationService.showError(
        this._translateService.instant('admin-panel.cannotDeleteOwnAccount')
      );
    } else {
      this._confirmationService.confirm({
        message: this._translateService.instant('admin-panel.confirm-delete'),
        acceptLabel: this._translateService.instant('yes'),
        rejectLabel: this._translateService.instant('no'),
        accept: () => {
          this._userService.deleteUser(userId).subscribe({
            next: () => {
              this.users = this.users.filter((user) => user.id !== userId);
              this._notificationService.showSuccess(
                this._translateService.instant('admin-panel.userDeleted')
              );
            },
            error: (error) => {
              const apiError: ApiError = error?.error;
              const errorKey = apiError?.detail || 'error.details';
              this._notificationService.showError(this._translateService.instant(errorKey));
            },
          });
        },
      });
    }
  }

  public openEmployeeDialog(): void {
    this.showEmployeeDialog.set(true);
  }

  public closeEmployeeDialog(): void {
    this.showEmployeeDialog.set(false);
  }

  public onEmployeeDialogSuccess(): void {
    this.showEmployeeDialog.set(false);
    this.loadUsers();
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
      this.users = [...this.initialValue];
      this.dt().reset();
    }
  }

  private loadUsers(): void {
    this._userService
      .getAllUsers()
      .pipe(
        switchMap((users) =>
          this._caseService.getAllCases().pipe(map((cases) => ({ users, cases })))
        ),
        map(({ users, cases }) => {
          this.userCaseCounts.clear();

          const usersWithCaseCounts = users.map((user) => {
            if (user.id) {
              const assignedCases = cases.filter((c) => c.assignedColleague?.id === user.id);
              const caseCount = assignedCases.length;
              this.userCaseCounts.set(user.id, caseCount);

              return { ...user, caseCount };
            }
            return { ...user, caseCount: 0 };
          });

          return usersWithCaseCounts;
        })
      )
      .subscribe({
        next: (users) => {
          this.users = users || [];
          this.initialValue = [...this.users];
          this.loading = false;
        },
        error: (error) => {
          const apiError: ApiError = error?.error;
          const errorKey = apiError?.detail || 'error.message';
          this._notificationService.showError(this._translateService.instant(errorKey));
        },
      });
  }

  public getRoleTranslation(role: Roles): string {
    return this._translateService.instant('roles.' + role);
  }

  public onRolesFilterClear(): void {
    this.rolesFilterValue = null;
  }
}
