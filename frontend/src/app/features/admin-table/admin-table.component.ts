import { Component, inject, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { User } from '../../shared/types/user';
import { UserService } from '../../shared/services/user.service';
import { NotificationService } from '../../shared/services/toaster/notification.service';
import { ApiError } from '../../shared/types/api-error';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-table',
  imports: [TableModule, CommonModule],
  templateUrl: './admin-table.component.html',
  styleUrl: './admin-table.component.scss',
})
export class AdminTableComponent implements OnInit {
  private readonly _userService = inject(UserService);
  private readonly _notificationService = inject(NotificationService);
  private readonly _translateService = inject(TranslateService);
  public users: User[] = [];

  ngOnInit(): void {
    console.log('AdminTableComponent initialized');
    this.loadUsers();
  }

  public concatenateName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  private loadUsers(): void {
    console.log('Api call');
    this._userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users || [];
        console.log(users);
        console.log(users.length);
        console.log(users[0].email);
      },
      error: (error) => {
        const apiError: ApiError = error?.error;
        this._notificationService.showError(this._translateService.instant(apiError.detail));
      },
    });
  }
}
