import { Injectable, signal } from '@angular/core';

export interface EligibilityResult {
  isEligible: boolean | null;
  isLoading: boolean;
  errorMessage: string | undefined;
  hasBeenChecked: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class EligibilityDataService {
  private readonly _eligibilityResult = signal<EligibilityResult>({
    isEligible: null,
    isLoading: false,
    errorMessage: undefined,
    hasBeenChecked: false,
  });

  public readonly eligibilityResult = this._eligibilityResult.asReadonly();

  public setEligibilityResult(result: Partial<EligibilityResult>): void {
    this._eligibilityResult.update((current) => ({
      ...current,
      ...result,
    }));
  }

  public resetEligibilityResult(): void {
    this._eligibilityResult.set({
      isEligible: null,
      isLoading: false,
      errorMessage: undefined,
      hasBeenChecked: false,
    });
  }

  public hasValidResult(): boolean {
    const result = this._eligibilityResult();
    return result.hasBeenChecked && !result.isLoading && result.errorMessage === undefined;
  }
}
