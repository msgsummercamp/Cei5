import { Component, inject, input, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { Roles } from '../types/enums/roles';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { ApiError } from '../types/api-error';
import { NotificationService } from '../services/toaster/notification.service';
@Component({
  selector: 'app-employee-dialog',
  imports: [
    ButtonModule,
    DialogModule,
    InputTextModule,
    CommonModule,
    TranslatePipe,
    SelectModule,
    FormsModule,
  ],
  templateUrl: './employee-dialog.component.html',
  styleUrl: './employee-dialog.component.scss',
})
export class EmployeeDialogComponent {
  private readonly _userService = inject(UserService);
  private readonly _translateService = inject(TranslateService);
  private readonly _notificationService = inject(NotificationService);

  visible = input<boolean>(false);

  onCancel = output<void>();
  onSuccess = output<void>();
  visibleChange = output<boolean>();

  private dialogVisible = signal(false);

  public loading = signal<boolean>(false);

  public roles = [
    { name: 'Admin', value: Roles.ADMIN },
    { name: 'User', value: Roles.USER },
    { name: 'Employee', value: Roles.EMPLOYEE },
  ];

  public selectedRole = signal<{ name: string; value: Roles } | null>(null);

  public firstName = signal<string>('');
  public lastName = signal<string>('');
  public email = signal<string>('');

  public showDialog(): void {
    this.dialogVisible.set(true);
  }

  public onCancelClick(): void {
    this.resetForm();
    this.visibleChange.emit(false);
    this.onCancel.emit();
  }

  public onSaveClick(): void {
    if (!this.isFormValid()) {
      this._notificationService.showError(
        this._translateService.instant('employee-dialog.fillAllFields')
      );
      return;
    }

    this.loading.set(true);

    const employeeData = {
      firstName: this.firstName(),
      lastName: this.lastName(),
      email: this.email(),
      role: this.selectedRole()?.value,
    };

    this._userService.createUser(employeeData).subscribe({
      next: (response) => {
        this._notificationService.showSuccess(
          this._translateService.instant('employee-dialog.userCreated')
        );
        this.resetForm();
        this.loading.set(false);
        this.visibleChange.emit(false);
        this.onSuccess.emit();
      },
      error: (error) => {
        this.loading.set(false);
        const apiError: ApiError = error.error.details;
        const errorKey = apiError?.detail || 'employee-dialog.createUserError';
        this._notificationService.showError(this._translateService.instant(errorKey));
      },
    });
  }

  private isFormValid(): boolean {
    return !!(this.firstName() && this.lastName() && this.email() && this.selectedRole());
  }
  private resetForm(): void {
    this.firstName.set('');
    this.lastName.set('');
    this.email.set('');
    this.selectedRole.set(null);
  }
}
