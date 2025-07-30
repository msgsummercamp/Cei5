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
import { MessageModule } from 'primeng/message';

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
    MessageModule,
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
  public maxConnections = 4;
  public connectionIdCounter = 0;
  public connectionFlights: ({
    id: number;
    valid: boolean;
    data: FlightDetails | null;
  } | null)[] = new Array(this.maxConnections).fill(null);

  protected readonly reservationForm = this._formBuilder.group({
    reservationNumber: new FormControl<string>(''),
    departingAirport: new FormControl<string>(''),
    destinationAirport: new FormControl<string>(''),
  });

  public onPrevious(prevCallback?: Function) {
    this.currentStep--;
    if (prevCallback) {
      prevCallback();
    }
  }

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

  public onNextFromConnectionFlights(nextCallback?: Function): void {
    if (this.areAllConnectionFlightsValid()) {
      this.currentStep++;
      if (nextCallback) {
        nextCallback();
      }
    }
  }

  public isMainFlightValid(mainFlightForm: any): boolean {
    return mainFlightForm?.flightDetailsForm?.valid || false;
  }

  public addConnectionFlight(): void {
    const emptyIndex = this.connectionFlights.findIndex(
      (flight) => flight === null
    );
    if (emptyIndex !== -1) {
      this.connectionFlights[emptyIndex] = {
        id: emptyIndex + 1,
        valid: false,
        data: null,
      };
    }
  }

  public canAddMoreConnections(): boolean {
    return this.connectionFlights.some((flight) => flight === null);
  }

  public removeConnectionFlight(index: number): void {
    if (index >= 0 && index < this.connectionFlights.length) {
      this.connectionFlights[index] = null;
    }
  }

  public areAllConnectionFlightsValid(): boolean {
    const activeFlights = this.connectionFlights.filter(
      (flight) => flight !== null
    );
    if (activeFlights.length === 0) {
      return true;
    }
    // change this after validations are implemented
    return true;
  }

  public onConnectionFlightValidityChange(
    index: number,
    isValid: boolean,
    data: FlightDetails | null
  ): void {
    if (this.connectionFlights[index]) {
      this.connectionFlights[index].valid = isValid;
      this.connectionFlights[index].data = data;
    }
  }

  public getActiveConnectionFlights(): {
    id: number;
    valid: boolean;
    data: FlightDetails | null;
  }[] {
    return this.connectionFlights.filter(
      (
        flight
      ): flight is {
        id: number;
        valid: boolean;
        data: FlightDetails | null;
      } => flight !== null
    );
  }
}
