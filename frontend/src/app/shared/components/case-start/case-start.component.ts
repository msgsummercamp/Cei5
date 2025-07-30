import { Component, inject } from '@angular/core';
import { StepperModule } from 'primeng/stepper';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import {
  FlightDetails,
  CaseFormComponent,
} from '../case-form/case-form.component';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-case-start',
  imports: [
    StepperModule,
    CardModule,
    FloatLabelModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    ButtonModule,
    InputTextModule,
    CaseFormComponent,
  ],
  templateUrl: './case-start.component.html',
  styleUrl: './case-start.component.scss',
})
export class CaseStartComponent {
  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _router = inject(Router);

  public currentStep = 1;
  public isFlightFormValid = false;
  public flightData: FlightDetails | null = null;

  protected readonly reservationForm = this._formBuilder.group({
    reservationNumber: new FormControl<string>(''),
    departingAirport: new FormControl<string>(''),
    destinationAirport: new FormControl<string>(''),
  });

  public onNext(nextCallback?: Function) {
    if (this.reservationForm.valid) {
      this.currentStep++;
      if (nextCallback) {
        nextCallback();
      }
    }
  }

  public onNextFromFlightDetails(
    nextCallback?: Function,
    mainFlightForm?: any
  ) {
    if (this.isMainFlightValid(mainFlightForm)) {
      this.flightData = mainFlightForm.getFormValue();
      this.currentStep++;
      if (nextCallback) {
        nextCallback();
      }
    }
  }

  public onPrevious(prevCallback?: Function) {
    this.currentStep--;
    if (prevCallback) {
      prevCallback();
    }
  }

  public isMainFlightValid(mainFlightForm: any): boolean {
    return mainFlightForm?.flightDetailsForm?.valid || false;
  }
}
