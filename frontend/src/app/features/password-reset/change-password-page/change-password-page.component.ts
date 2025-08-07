import { Component, inject } from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { passwordsMatchValidator } from '../../../shared/validators/passwordsMatchValidator';
import { Button } from 'primeng/button';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { TranslatePipe } from '@ngx-translate/core';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';

type ChangePasswordForm = {
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
};

@Component({
  selector: 'app-change-password-page',
  imports: [
    Button,
    ErrorMessageComponent,
    FloatLabel,
    InputText,
    ReactiveFormsModule,
    TranslatePipe,
    CardModule,
    PanelModule,
  ],
  templateUrl: './change-password-page.component.html',
  styleUrl: './change-password-page.component.scss',
})
export class ChangePasswordPageComponent {
  private readonly _authService = inject(AuthService);
  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly changePasswordForm = this._formBuilder.group<ChangePasswordForm>(
    {
      newPassword: this._formBuilder.control('', {
        validators: [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(30),
          Validators.pattern('^[a-zA-Z0-9!@#$%^&*()_+{}:"\'<>?|[\\];,./`~]{6,30}$'),
        ],
      }),
      confirmPassword: this._formBuilder.control('', {
        validators: [Validators.required],
      }),
    },
    {
      validators: passwordsMatchValidator(),
    }
  );

  protected onFormSubmit(): void {
    if (this.changePasswordForm.valid) {
      const newPassword: string = this.changePasswordForm.get('newPassword')?.value || '';
      this._authService.resetPassword(newPassword);
    }
  }

  protected hasNewPasswordPatternError(): boolean {
    return (
      !this.changePasswordForm.controls.newPassword.hasError('pattern') &&
      !this.changePasswordForm.controls.newPassword.hasError('required')
    );
  }

  protected hasNewPasswordGoodLength(): boolean {
    return (
      !this.changePasswordForm.controls.newPassword.hasError('minlength') &&
      !this.changePasswordForm.controls.newPassword.hasError('maxlength') &&
      !this.changePasswordForm.controls.newPassword.hasError('required')
    );
  }
}
