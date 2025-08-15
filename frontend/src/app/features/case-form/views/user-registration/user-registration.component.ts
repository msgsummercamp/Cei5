import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import {
  FormControl,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { TranslatePipe } from '@ngx-translate/core';
import { DatePicker } from 'primeng/datepicker';
import { CountryISO, IntlInputTelComponent, SearchCountryField } from 'p-intl-input-tel';
import { PhoneNumberFormat } from 'google-libphonenumber';
import { PanelModule } from 'primeng/panel';
import { Checkbox } from 'primeng/checkbox';
import { CaseFormUserData } from '../../../../shared/types/case-form-userdata';
import { CaseFormUserDetailsService } from '../../../../shared/services/case-form-user-details.service';

type UserRegistrationForm = {
  email: FormControl<string>;
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  address: FormControl<string>;
  phoneNumber: FormControl<string>;
  postalCode: FormControl<string>;
  birthDate: FormControl<Date | null>;
  completingForSomeoneElse: FormControl<boolean>;
  someoneElseFirstName: FormControl<string>;
  someoneElseLastName: FormControl<string>;
  someoneElseAddress: FormControl<string>;
  someoneElsePostalCode: FormControl<string>;
  someoneElseIsUnderage: FormControl<boolean>;
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
  ],
  templateUrl: './user-registration.component.html',
  styleUrl: './user-registration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserRegistrationComponent {
  private readonly _caseFormUserDetailsService = inject(CaseFormUserDetailsService);
  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private areFieldsDisabled = false;
  private hasInitialized = false;
  private lastEmitted: { valid: boolean; data: CaseFormUserData | null } | null = null;

  public readonly initialData = input<CaseFormUserData | undefined>(undefined);
  public readonly isUserReadOnly = input(false);

  public readonly validityChange = output<{ valid: boolean; data: CaseFormUserData | null }>();

  public readonly searchCountryField = SearchCountryField;
  public readonly countryISO = CountryISO;
  public readonly phoneNumberFormat = PhoneNumberFormat;
  public acceptedTerms = false;
  public acceptedGDPR = false;
  public underage = false;

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
    birthDate: this._formBuilder.control<Date | null>(null),
    completingForSomeoneElse: this._formBuilder.control<boolean>(false),
    someoneElseFirstName: this._formBuilder.control<string>(''),
    someoneElseLastName: this._formBuilder.control<string>(''),
    someoneElseAddress: this._formBuilder.control<string>(''),
    someoneElsePostalCode: this._formBuilder.control<string>(''),
    someoneElseIsUnderage: this._formBuilder.control<boolean>(false),
  });

  constructor() {
    this.userRegistrationForm.statusChanges.subscribe(() => {
      this.checkAndEmitValidity();
    });

    this.setDynamicValidators();

    effect(() => {
      const data = this.initialData();
      const readOnly = this.isUserReadOnly();
      console.log(readOnly);
      if (data && !this.hasInitialized) {
        this.hasInitialized = true;

        const patch: any = {
          email: data.completedBy.email || '',
          firstName: data.completedBy.firstName || '',
          lastName: data.completedBy.lastName || '',
          address: data.completedBy.userDetails?.address || '',
          phoneNumber: data.completedBy.userDetails?.phoneNumber || '',
          postalCode: data.completedBy.userDetails?.postalCode || '',
          birthDate: data.completedBy.userDetails?.birthDate
            ? new Date(data.completedBy.userDetails.birthDate)
            : null,
          completingForSomeoneElse: !!data.completedFor,
          someoneElseFirstName: data.completedFor?.firstName ?? undefined,
          someoneElseLastName: data.completedFor?.lastName ?? undefined,
          someoneElseAddress: data.completedFor?.address ?? undefined,
          someoneElsePostalCode: data.completedFor?.postalCode ?? undefined,
          someoneElseIsUnderage: data.completedFor?.isUnderage ?? undefined,
        };

        this.userRegistrationForm.patchValue(patch, { emitEvent: false });

        setTimeout(() => {
          this.checkAndEmitValidity();
        }, 0);
      }

      if (readOnly) {
        this.disableUserFields();
        this.areFieldsDisabled = true;
      }
    });
  }

  private getValidatorsForField(field: string): ValidatorFn[] {
    switch (field) {
      case 'someoneElseFirstName':
        return [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-ZÀ-ÿ\s-]+$/),
        ];
      case 'someoneElseLastName':
        return [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-ZÀ-ÿ\s-]+$/),
        ];
      case 'someoneElseAddress':
        return [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z0-9\s,.'-]+$/),
        ];
      case 'someoneElsePostalCode':
        return [
          Validators.required,
          Validators.maxLength(10),
          Validators.pattern(/^[a-zA-Z0-9- ]+$/),
        ];
      default:
        return [];
    }
  }

  public getUserFormDetails(): CaseFormUserData | null {
    if (!this.userRegistrationForm.valid) return null;

    const birthDateValue = this.userRegistrationForm.get('birthDate')?.value;
    const completingForSomeoneElse =
      this.userRegistrationForm.get('completingForSomeoneElse')?.value || false;

    const completedBy = {
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

    let result: CaseFormUserData = { completedBy, completedFor: null };

    if (completingForSomeoneElse) {
      result.completedFor = {
        firstName: this.userRegistrationForm.get('someoneElseFirstName')?.value || '',
        lastName: this.userRegistrationForm.get('someoneElseLastName')?.value || '',
        address: this.userRegistrationForm.get('someoneElseAddress')?.value || '',
        postalCode: this.userRegistrationForm.get('someoneElsePostalCode')?.value || '',
        isUnderage: this.userRegistrationForm.get('someoneElseIsUnderage')?.value || false,
      };
    }

    this._caseFormUserDetailsService.setUserDetails(result);
    this._caseFormUserDetailsService.setUserCompletesForSomeoneElse(
      completingForSomeoneElse && !!result.completedFor && !result.completedFor.isUnderage
    );

    return result;
  }

  public checkAndEmitValidity(): void {
    const isFormValid = this.userRegistrationForm.valid;
    const isValid = isFormValid && this.acceptedTerms && this.acceptedGDPR;
    const data = isValid ? this.getUserFormDetails() : null;
    if (
      !this.lastEmitted ||
      this.lastEmitted.valid !== isValid ||
      JSON.stringify(this.lastEmitted.data) !== JSON.stringify(data)
    ) {
      this.validityChange.emit({ valid: isValid, data });
      this.lastEmitted = { valid: isValid, data };
    }
  }

  public filterDetails(): void {
    const hasBeneficiary = this.userRegistrationForm.get('completingForSomeoneElse')?.value;
    if (hasBeneficiary && this.underage) {
    } else {
    }
  }

  private disableUserFields(): void {
    const fields = [
      'email',
      'firstName',
      'lastName',
      'address',
      'phoneNumber',
      'postalCode',
      'birthDate',
    ];

    fields.forEach((field) => {
      const control = this.userRegistrationForm.get(field);
      if (control) {
        control.disable();
      }
    });
  }

  private setDynamicValidators(): void {
    this.userRegistrationForm
      .get('completingForSomeoneElse')
      ?.valueChanges.subscribe((isCompleting) => {
        const fields = [
          'someoneElseFirstName',
          'someoneElseLastName',
          'someoneElseAddress',
          'someoneElsePostalCode',
        ];

        fields.forEach((field) => {
          const control = this.userRegistrationForm.get(field);
          if (control) {
            if (isCompleting) {
              control.setValidators(this.getValidatorsForField(field));
            } else {
              control.clearValidators();
            }
            control.updateValueAndValidity();
          }
        });
      });
  }
}
