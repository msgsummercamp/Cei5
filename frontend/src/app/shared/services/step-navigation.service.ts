import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StepNavigationService {
  private currentStepSubject = new BehaviorSubject<number>(1);
  public currentStep$ = this.currentStepSubject.asObservable();

  public getCurrentStep(): number {
    return this.currentStepSubject.value;
  }

  public setCurrentStep(step: number): void {
    this.currentStepSubject.next(step);
  }

  public nextStep(): void {
    this.currentStepSubject.next(this.currentStepSubject.value + 1);
  }

  public previousStep(): void {
    const currentStep = this.currentStepSubject.value;
    if (currentStep > 1) {
      this.currentStepSubject.next(currentStep - 1);
    }
  }

  public skipStep(): void {
    this.currentStepSubject.next(this.currentStepSubject.value + 2);
  }

  public goBackFromDisruptionInfo(allFlightsLength: number): void {
    this.currentStepSubject.next(this.currentStepSubject.value - 1);
    if (allFlightsLength === 1) {
      this.currentStepSubject.next(this.currentStepSubject.value - 1);
    }
  }

  public resetToFirstStep(): void {
    this.currentStepSubject.next(1);
  }
}
