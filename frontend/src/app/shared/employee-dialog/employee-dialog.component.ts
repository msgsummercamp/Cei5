import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { Roles } from '../types/enums/roles';
import {
  FormControl,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../services/user.service';
import { ApiError } from '../types/api-error';
import { NotificationService } from '../services/toaster/notification.service';
import { ErrorMessageComponent } from '../components/error-message/error-message.component';
import { FloatLabel } from 'primeng/floatlabel';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

type NewUserForm = {
  email: FormControl<string>;
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  role: FormControl<Roles | undefined>;
};

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
    ErrorMessageComponent,
    FloatLabel,
    ReactiveFormsModule,
  ],
  templateUrl: './employee-dialog.component.html',
  styleUrl: './employee-dialog.component.scss',
})
export class EmployeeDialogComponent implements OnInit {
  private readonly _userService = inject(UserService);
  private readonly _translateService = inject(TranslateService);
  private readonly _notificationService = inject(NotificationService);
  private readonly _formBuilder = inject(NonNullableFormBuilder);

  public roles: { name: string; value: Roles }[] = [];

  visible = input<boolean>(false);
  onCancel = output<void>();
  onSuccess = output<void>();
  visibleChange = output<boolean>();
  private langChangeSub?: Subscription;

  loading = signal(false);

  protected readonly newUserForm = this._formBuilder.group<NewUserForm>({
    email: this._formBuilder.control<string>('', [
      Validators.required,
      Validators.email,
      Validators.maxLength(254),
    ]),
    firstName: this._formBuilder.control<string>('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-ZÀ-ÿ\s-]+$/),
    ]),
    lastName: this._formBuilder.control<string>('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-ZÀ-ÿ\s-]+$/),
    ]),
    role: this._formBuilder.control<Roles | undefined>(undefined, [Validators.required]),
  });

  ngOnInit(): void {
    this.buildRoleOptions();
    this.langChangeSub = this._translateService.onLangChange.subscribe(() => {
      this.buildRoleOptions();
    });
  }

  private buildRoleOptions(): void {
    this.roles = Object.values(Roles)
      .filter((role) => role !== Roles.USER)
      .map((role) => ({
        name: this.getRoleTranslation(role as Roles),
        value: role,
      }));
  }

  public showDialog(): void {
    this.visibleChange.emit(true);
  }

  public onCancelClick(): void {
    this.newUserForm.reset();
    this.visibleChange.emit(false);
    this.onCancel.emit();
  }

  public onSaveClick(): void {
    if (this.newUserForm.invalid) {
      this._notificationService.showError(
        this._translateService.instant('employee-dialog.fillAllFields')
      );
      return;
    }

    this.loading.set(true);

    this._userService.createUser(this.newUserForm.getRawValue()).subscribe({
      next: () => {
        this.newUserForm.reset();
        this.loading.set(false);
        this.visibleChange.emit(false);
        this.onSuccess.emit();
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        if (error.status === 0) {
          this._notificationService.showError(
            this._translateService.instant('api-errors.network-error')
          );
        } else {
          const apiError: ApiError = error?.error;
          this._notificationService.showError(this._translateService.instant(apiError.detail));
        }
      },
    });
  }

  public getRoleTranslation(role: Roles): string {
    return this._translateService.instant('roles.' + role);
  }
}
