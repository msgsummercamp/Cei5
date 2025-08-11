import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import {
  FormControl,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User } from '../../../../shared/types/user';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { TranslatePipe } from '@ngx-translate/core';
import { DatePicker } from 'primeng/datepicker';
import { CountryISO, IntlInputTelComponent, SearchCountryField } from 'p-intl-input-tel';
import { PhoneNumberFormat } from 'google-libphonenumber';
import { PanelModule } from 'primeng/panel';
import { Checkbox } from 'primeng/checkbox';
import { ScrollPanel } from 'primeng/scrollpanel';

type UserRegistrationForm = {
  email: FormControl<string>;
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  address: FormControl<string>;
  phoneNumber: FormControl<string>;
  postalCode: FormControl<string>;
  birthDate: FormControl<Date | null>;
};

@Component({
  selector: 'app-user-registration',
  imports: [
    ErrorMessageComponent,
    FloatLabel,
    InputText,
    ReactiveFormsModule,
    TranslatePipe,
    DatePicker,
    IntlInputTelComponent,
    PanelModule,
    Checkbox,
    FormsModule,
    ScrollPanel,
  ],
  templateUrl: './user-registration.component.html',
  styleUrl: './user-registration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserRegistrationComponent {
  private readonly _formBuilder = inject(NonNullableFormBuilder);

  public readonly initialData = input<User | undefined>(undefined);
  public readonly isUserReadOnly = input(false);

  public readonly validityChange = output<{ valid: boolean; data: User | null }>();

  public readonly searchCountryField = SearchCountryField;
  public readonly countryISO = CountryISO;
  public readonly phoneNumberFormat = PhoneNumberFormat;
  public acceptedTerms = false;

  // Date limits for birth date
  protected readonly maxDate = (() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date;
  })();
  protected readonly minDate = (() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 125);
    return date;
  })();

  protected readonly userRegistrationForm = this._formBuilder.group<UserRegistrationForm>({
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
    address: this._formBuilder.control<string>('', [
      Validators.required,
      Validators.maxLength(100),
      Validators.pattern(/^[a-zA-Z0-9\s,.'-]+$/),
    ]),
    phoneNumber: this._formBuilder.control<string>('', [
      Validators.required,
      Validators.minLength(9),
    ]),
    postalCode: this._formBuilder.control<string>('', [
      Validators.required,
      Validators.maxLength(10),
      Validators.pattern(/^[a-zA-Z0-9- ]+$/),
    ]),
    birthDate: this._formBuilder.control<Date | null>(null, [Validators.required]),
  });

  constructor() {
    this.userRegistrationForm.statusChanges.subscribe(() => {
      this.checkAndEmitValidity();
    });
    let hasInitialized = false;

    effect(() => {
      const data = this.initialData();
      const readOnly = this.isUserReadOnly();

      if (data && !hasInitialized) {
        hasInitialized = true;
        this.userRegistrationForm.patchValue(
          {
            email: data.email || '',
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            address: data.userDetails?.address || '',
            phoneNumber: data.userDetails?.phoneNumber || '',
            postalCode: data.userDetails?.postalCode || '',
            birthDate: data.userDetails?.birthDate ? new Date(data.userDetails.birthDate) : null,
          },
          { emitEvent: false }
        );

        setTimeout(() => {
          this.checkAndEmitValidity();
        }, 0);
      }

      if (readOnly) {
        this.userRegistrationForm.disable();
      }
    });
  }

  public getUserFormDetails(): User | null {
    if (this.userRegistrationForm.valid) {
      const birthDateValue = this.userRegistrationForm.get('birthDate')?.value;
      return {
        email: this.userRegistrationForm.get('email')?.value,
        firstName: this.userRegistrationForm.get('firstName')?.value,
        lastName: this.userRegistrationForm.get('lastName')?.value,
        userDetails: {
          address: this.userRegistrationForm.get('address')?.value,
          phoneNumber: this.userRegistrationForm.get('phoneNumber')?.value,
          postalCode: this.userRegistrationForm.get('postalCode')?.value,
          birthDate: birthDateValue ? birthDateValue.toDateString() : undefined,
        },
      };
    }
    return null;
  }

  public checkAndEmitValidity(): void {
    const isFormValid = this.userRegistrationForm.valid || this.userRegistrationForm.disabled;
    const isValid = isFormValid && this.acceptedTerms;
    const data = isValid ? this.getUserFormDetails() : null;
    this.validityChange.emit({ valid: isValid, data: data });
  }
}
