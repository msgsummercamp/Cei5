import { Component, inject } from '@angular/core';
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
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabelModule } from 'primeng/floatlabel';

export type DisruptionForm = {
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
    FormsModule,
    TextareaModule,
    FloatLabelModule,
  ],
  templateUrl: './disruption-form.component.html',
  styleUrl: './disruption-form.component.scss',
})
export class DisruptionFormComponent {
  // CONSTANTS
  public readonly DISRUPTIONS = ['Cancellation', 'Delay', 'Denied Boarding'];

  // Private State
  private readonly _formBuilder = inject(NonNullableFormBuilder);

  // Protected State
  protected readonly disruptionForm = this._formBuilder.group<DisruptionForm>({
    disruptionType: this._formBuilder.control('', [Validators.required]),
    cancellationAnswer: this._formBuilder.control(''),
    delayAnswer: this._formBuilder.control(''),
    deniedBoardingAnswer: this._formBuilder.control(''),
    deniedBoardingFollowUpAnswer: this._formBuilder.control(''),
    airlineMotiveAnswer: this._formBuilder.control(''),
    airlineMotiveFollowUpAnswer: this._formBuilder.control(''),
    disruptionInformation: this._formBuilder.control('', [
      Validators.required,
      Validators.maxLength(1000),
    ]),
  });
}
