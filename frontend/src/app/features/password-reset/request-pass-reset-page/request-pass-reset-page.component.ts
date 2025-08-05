import { Component, inject } from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { Button } from 'primeng/button';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { TranslatePipe } from '@ngx-translate/core';

type RequestResetForm = {
  email: FormControl<string>;
};

@Component({
  selector: 'app-request-pass-reset-page',
  imports: [
    Button,
    ErrorMessageComponent,
    FloatLabel,
    InputText,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './request-pass-reset-page.component.html',
  styleUrl: './request-pass-reset-page.component.scss',
})
export class RequestPassResetPageComponent {
  private readonly _authService = inject(AuthService);
  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly requestResetForm = this._formBuilder.group<RequestResetForm>({
    email: this._formBuilder.control('', {
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
  });

  protected onFormSubmit(): void {
    if (this.requestResetForm.valid) {
      const email: string = this.requestResetForm.get('email')?.value || '';
      this._authService.sendPasswordResetEmail(email);
    }
  }
}
