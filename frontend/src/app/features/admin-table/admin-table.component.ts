import { Component, inject, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { User } from '../../shared/types/user';
import { UserService } from '../../shared/services/user.service';
import { NotificationService } from '../../shared/services/toaster/notification.service';
import { ApiError } from '../../shared/types/api-error';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { CaseService } from '../../shared/services/case.service';
import { map, Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-admin-table',
  imports: [TableModule, CommonModule],
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

  ngOnInit(): void {
    console.log('AdminTableComponent initialized');
    this.loadUsers();
  }

  public concatenateName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  public getCaseCountForUser(userId: string): number {
    return this.userCaseCounts.get(userId) || 0;
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

          users.map((user) => {
            if (user.id) {
              const assignedCases = cases.filter((c) => c.assignedColleague?.id === user.id);
              this.userCaseCounts.set(user.id, assignedCases.length);
            }
            return user;
          });

          return users;
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
