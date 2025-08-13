import { Component, inject, output, effect, signal, input } from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TranslatePipe } from '@ngx-translate/core';
import { DisruptionReasons } from '../../../../shared/types/enums/disruption-reason';

type DisruptionForm = {
  disruptionType: FormControl<string>;
  cancellationAnswer: FormControl<string | null>;
  delayAnswer: FormControl<string | null>;
  deniedBoardingAnswer: FormControl<string | null>;
  deniedBoardingFollowUpAnswer: FormControl<string | null>;
  airlineMotiveAnswer: FormControl<string | null>;
  airlineMotiveFollowUpAnswer: FormControl<string | null>;
  disruptionInformation: FormControl<string>;
};

export type DisruptionFormData = {
  disruptionType: string;
  cancellationAnswer: string | null;
  delayAnswer: string | null;
  deniedBoardingAnswer: string | null;
  deniedBoardingFollowUpAnswer: string | null;
  airlineMotiveAnswer: string | null;
  airlineMotiveFollowUpAnswer: string | null;
  disruptionInformation: string;
};

enum Disruptions {
  Cancellation = 'Cancellation',
  Delay = 'Delay',
  Denied_Boarding = 'Denied_Boarding',
}

@Component({
  selector: 'app-disruption-form',
  imports: [
    ReactiveFormsModule,
    SelectModule,
    ErrorMessageComponent,
    RadioButtonModule,
    MessageModule,
    TextareaModule,
    FloatLabelModule,
    TranslatePipe,
  ],
  templateUrl: './disruption-form.component.html',
  styleUrl: './disruption-form.component.scss',
})
export class DisruptionFormComponent {
  private readonly _formBuilder = inject(NonNullableFormBuilder);

  public readonly initialData = input<DisruptionFormData | null>(null);

  private formValid = signal(false);

  protected readonly reasons = [
    Disruptions.Cancellation,
    Disruptions.Delay,
    Disruptions.Denied_Boarding,
  ];

  protected readonly disruptionForm = this._formBuilder.group<DisruptionForm>({
    disruptionType: this._formBuilder.control('', [Validators.required]), //disruption Reason
    cancellationAnswer: this._formBuilder.control<string | null>(null),
    delayAnswer: this._formBuilder.control<string | null>(null),
    deniedBoardingAnswer: this._formBuilder.control<string | null>(null),
    deniedBoardingFollowUpAnswer: this._formBuilder.control<string | null>(null),
    airlineMotiveAnswer: this._formBuilder.control<string | null>(null),
    airlineMotiveFollowUpAnswer: this._formBuilder.control<string | null>(null),
    disruptionInformation: this._formBuilder.control('', [
      Validators.required,
      Validators.maxLength(1000),
    ]),
  });

  public readonly disruptionReason = output<string>();
  public readonly disruptionInfo = output<string>();
  public readonly validityChange = output<{
    valid: boolean;
    data?: DisruptionFormData | null;
  } | null>();

  /**
   *
   * @returns the text that is in the text box on the disruption form
   */
  public getDisruptionDescription(): string {
    return this.disruptionForm.controls.disruptionInformation.value;
  }

  /**
   *
   * @returns the response from the disruption form that is needed for the backend
   */
  public getResponseForDisruption(): string {
    const disruption = this.disruptionForm.controls;

    if (disruption.airlineMotiveAnswer.value === 'Yes') {
      if (
        disruption.airlineMotiveFollowUpAnswer.value === 'Meteorological conditions' ||
        disruption.airlineMotiveFollowUpAnswer.value === "Airport Staff's Strike" ||
        disruption.airlineMotiveFollowUpAnswer.value === 'Problems with airport'
      ) {
        return DisruptionReasons.NOT_ELIGIBLE_REASON;
      }
    }

    if (disruption.disruptionType.value === Disruptions.Cancellation) {
      if (disruption.cancellationAnswer.value === '>14 days') {
        return DisruptionReasons.CONDITIONS_NOT_FULFILLED;
      } else if (disruption.cancellationAnswer.value === '<14 days') {
        if (disruption.delayAnswer.value === '>3 hours') {
          return DisruptionReasons.CANCELLATION_UNDER_14_DAYS_AND_OVER_3H;
        } else if (disruption.delayAnswer.value === '<3 hours') {
          return DisruptionReasons.CONDITIONS_NOT_FULFILLED;
        } else {
          return DisruptionReasons.CANCELLATION_UNDER_14_DAYS_AND_NEVER_ARRIVED;
        }
      } else {
        if (disruption.delayAnswer.value === '>3 hours') {
          return DisruptionReasons.CANCELLATION_ON_DAY_OF_DEPARTURE_AND_OVER_3H;
        } else if (disruption.delayAnswer.value === '<3 hours') {
          return DisruptionReasons.CONDITIONS_NOT_FULFILLED;
        } else {
          return DisruptionReasons.CANCELLATION_ON_DAY_OF_DEPARTURE_AND_NEVER_ARRIVED;
        }
      }
    } else if (disruption.disruptionType.value === Disruptions.Delay) {
      if (disruption.delayAnswer.value === '>3 hours') {
        return DisruptionReasons.ARRIVED_3H_LATE;
      } else if (disruption.delayAnswer.value === '<3 hours') {
        return DisruptionReasons.CONDITIONS_NOT_FULFILLED;
      }
      return DisruptionReasons.NEVER_ARRIVED;
    } else {
      if (disruption.deniedBoardingAnswer.value === 'No') {
        if (disruption.deniedBoardingFollowUpAnswer.value === 'Flight overbooked') {
          return DisruptionReasons.OVERBOOKING;
        } else if (disruption.deniedBoardingFollowUpAnswer.value === 'Unspecified reason') {
          return DisruptionReasons.DENIED_BOARDING_WITHOUT_REASON;
        } else {
          return DisruptionReasons.NOT_ELIGIBLE_REASON;
        }
      } else {
        return DisruptionReasons.DENIED_BOARDING_WITHOUT_REASON;
      }
    }
  }

  private hasAllRequiredFields(): boolean {
    const {
      disruptionType,
      disruptionInformation,
      cancellationAnswer,
      delayAnswer,
      deniedBoardingAnswer,
      deniedBoardingFollowUpAnswer,
      airlineMotiveAnswer,
      airlineMotiveFollowUpAnswer,
    } = this.disruptionForm.controls;

    if (!disruptionType.value || !disruptionInformation.value) return false;

    // Conditional requirements based on what's visible
    switch (disruptionType.value) {
      case Disruptions.Cancellation:
        if (!cancellationAnswer.value || !airlineMotiveAnswer.value) return false;
        if (airlineMotiveAnswer.value === 'Yes' && !airlineMotiveFollowUpAnswer.value) return false;
        break;

      case Disruptions.Delay:
        if (!delayAnswer.value || !airlineMotiveAnswer.value) return false;
        if (airlineMotiveAnswer.value === 'Yes' && !airlineMotiveFollowUpAnswer.value) return false;
        break;

      case Disruptions.Denied_Boarding:
        if (!deniedBoardingAnswer.value) return false;
        if (deniedBoardingAnswer.value === 'No' && !deniedBoardingFollowUpAnswer.value)
          return false;
        break;
    }

    return true;
  }

  public resetForm(): void {
    this.disruptionForm.reset();
  }

  constructor() {
    this.disruptionForm.statusChanges.subscribe(() => {
      this.checkAndEmitValidity();
    });
    let hasInitialized = false;

    effect(() => {
      const data = this.initialData();

      if (data && !hasInitialized) {
        hasInitialized = true;
        this.disruptionForm.patchValue(
          {
            disruptionType: data.disruptionType || '',
            cancellationAnswer: data.cancellationAnswer || null,
            delayAnswer: data.delayAnswer || null,
            deniedBoardingAnswer: data.deniedBoardingAnswer || null,
            deniedBoardingFollowUpAnswer: data.deniedBoardingFollowUpAnswer || null,
            airlineMotiveAnswer: data.airlineMotiveAnswer || null,
            airlineMotiveFollowUpAnswer: data.airlineMotiveFollowUpAnswer || null,
            disruptionInformation: data.disruptionInformation || '',
          },
          { emitEvent: false }
        );

        setTimeout(() => {
          this.checkAndEmitValidity();
        }, 0);
      }
    });

    this.formValid.set(this.disruptionForm.valid);
  }

  private checkAndEmitValidity(): void {
    const isValid = this.disruptionForm.valid && this.hasAllRequiredFields();
    const data = isValid ? this.getDisruptionFormDetails() : null;
    this.validityChange.emit({ valid: isValid, data: data });
  }

  private getDisruptionFormDetails(): DisruptionFormData {
    return {
      disruptionType: this.disruptionForm.controls.disruptionType.value,
      cancellationAnswer: this.disruptionForm.controls.cancellationAnswer.value,
      delayAnswer: this.disruptionForm.controls.delayAnswer.value,
      deniedBoardingAnswer: this.disruptionForm.controls.deniedBoardingAnswer.value,
      deniedBoardingFollowUpAnswer: this.disruptionForm.controls.deniedBoardingFollowUpAnswer.value,
      airlineMotiveAnswer: this.disruptionForm.controls.airlineMotiveAnswer.value,
      airlineMotiveFollowUpAnswer: this.disruptionForm.controls.airlineMotiveFollowUpAnswer.value,
      disruptionInformation: this.disruptionForm.controls.disruptionInformation.value,
    };
  }
}
