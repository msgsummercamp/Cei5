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
        validators: [Validators.required, Validators.minLength(6), Validators.maxLength(20)],
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
}
