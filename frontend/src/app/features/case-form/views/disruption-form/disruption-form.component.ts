import { Component, inject } from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
  ValueChangeEvent,
} from '@angular/forms';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabelModule } from 'primeng/floatlabel';

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
  ],
  templateUrl: './disruption-form.component.html',
  styleUrl: './disruption-form.component.scss',
})
export class DisruptionFormComponent {
  // CONSTANTS
  public readonly DISRUPTIONS = ['Cancellation', 'Delay', 'Denied Boarding'];
  public readonly DISRUPTION_REASONS = [
    'CANCELATION_NOTICE_UNDER_14_DAYS',
    'CANCELATION_NOTICE_OVER_14_DAYS',
    'CANCELATION_ON_DAY_OF_DEPARTURE',
    'ARRIVED_3H_LATE',
    'ARRIVED_EARLY',
    'NEVER_ARRIVED',
    'DID_NOT_GIVE_THE_SEAT_VOLUNTARILY',
    'DID_GIVE_THE_SEAT_VOLUNTARILY',
  ];

  // Private State
  private readonly _formBuilder = inject(NonNullableFormBuilder);

  // Protected State
  protected readonly disruptionForm = this._formBuilder.group<DisruptionForm>({
    disruptionType: this._formBuilder.control('', [Validators.required]),
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

    if (disruption.disruptionType.value === 'Cancellation') {
      if (disruption.cancellationAnswer.value === '>14 days') {
        return this.DISRUPTION_REASONS[1];
      } else if (disruption.cancellationAnswer.value === '<14 days') {
        return this.DISRUPTION_REASONS[0];
      }
      return this.DISRUPTION_REASONS[2];
    } else if (disruption.disruptionType.value === 'Delay') {
      if (disruption.delayAnswer.value === '>3 hours') {
        return this.DISRUPTION_REASONS[3];
      } else if (disruption.delayAnswer.value === '<3 hours') {
        return this.DISRUPTION_REASONS[4];
      }
      return this.DISRUPTION_REASONS[5];
    } else {
      if (disruption.deniedBoardingAnswer.value === 'No') {
        return this.DISRUPTION_REASONS[6];
      }
      return this.DISRUPTION_REASONS[7];
    }
  }
}
