import { Component, inject, OnInit, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { User } from '../../shared/types/user';
import { UserService } from '../../shared/services/user.service';
import { NotificationService } from '../../shared/services/toaster/notification.service';
import { ApiError } from '../../shared/types/api-error';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { CaseService } from '../../shared/services/case.service';
import { map, switchMap } from 'rxjs';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { EmployeeDialogComponent } from '../../shared/employee-dialog/employee-dialog.component';

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
  ],
  templateUrl: './admin-table.component.html',
  styleUrl: './admin-table.component.scss',
})
export class AdminTableComponent implements OnInit {
  private readonly _userService = inject(UserService);
  private readonly _caseService = inject(CaseService);
  private readonly _notificationService = inject(NotificationService);
  private readonly _translateService = inject(TranslateService);
  public users: User[] = [];
  public userCaseCounts = new Map<string, number>();
  public showEmployeeDialog = signal(false);

  ngOnInit(): void {
    this.loadUsers();
  }

  public concatenateName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  public getCaseCountForUser(userId: string): number {
    return this.userCaseCounts.get(userId) || 0;
  }

  public deleteUser(userId: string): void {
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
        },
        error: (error) => {
          const apiError: ApiError = error?.error;
          const errorKey = apiError?.detail || 'error.message';
          this._notificationService.showError(this._translateService.instant(errorKey));
        },
      });
  }
}
