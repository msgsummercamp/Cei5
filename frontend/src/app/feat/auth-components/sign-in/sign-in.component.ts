import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/services/auth.service';
import {
  FormControl,
  NonNullableFormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { SignInRequest } from '../../../core/auth/models/sign-in-request';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { Button } from 'primeng/button';

type SignInForm = {
  email: FormControl<string>;
  password: FormControl<string>;
};

@Component({
  selector: 'app-sign-in',
  imports: [FloatLabel, ReactiveFormsModule, InputText, ErrorMessageComponent, Button],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent {
  private readonly _authService = inject(AuthService);
  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly signInForm = this._formBuilder.group<SignInForm>({
    email: this._formBuilder.control('', {
      validators: [Validators.required, Validators.email, Validators.max(254)],
    }),
    password: this._formBuilder.control('', {
      validators: [Validators.required, Validators.minLength(6), Validators.maxLength(20)],
    }),
  });

  protected onFormSubmit(): void {
    if (this.signInForm.valid) {
      const signInRequest: SignInRequest = this.signInForm.getRawValue();
      this._authService.logIn(signInRequest);
    }
  }
}
