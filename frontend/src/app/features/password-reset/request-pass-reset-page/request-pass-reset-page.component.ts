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
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../../shared/services/toaster/notification.service';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';

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
    CardModule,
    PanelModule,
  ],
  templateUrl: './request-pass-reset-page.component.html',
  styleUrl: './request-pass-reset-page.component.scss',
})
export class RequestPassResetPageComponent {
  private readonly _authService = inject(AuthService);
  private readonly _notificationService = inject(NotificationService);
  private readonly _translationService = inject(TranslateService);
  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly requestResetForm = this._formBuilder.group<RequestResetForm>({
    email: this._formBuilder.control('', {
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
  });

  ngOnInit(): void {
    const emailFormState = window.history.state.email || '';
    if (emailFormState) {
      this.requestResetForm.get('email')?.setValue(emailFormState);
    }
  }

  protected onFormSubmit(): void {
    if (this.requestResetForm.valid) {
      const email: string = this.requestResetForm.get('email')?.value || '';
      this._notificationService.showInfo(
        this._translationService.instant('request-reset.email-sent')
      );
      this._authService.sendPasswordResetEmail(email);
    }
  }
}
