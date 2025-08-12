import { computed, Injectable, signal } from '@angular/core';
import { User } from '../types/user';
import { CaseFormUserData } from '../types/case-form-userdata';

@Injectable({
  providedIn: 'root',
})
export class CaseFormUserDetailsService {
  private readonly _caseFormUserDetails = signal<CaseFormUserData | undefined>(undefined);
  private readonly _isCompletedForSomeoneElse = signal(false);
  public readonly userDetails = this._caseFormUserDetails.asReadonly();

  public setUserDetails(caseFormUserData: CaseFormUserData) {
    this._caseFormUserDetails.set(caseFormUserData);
  }

  public setUserCompletesForSomeoneElse(val: boolean) {
    this._isCompletedForSomeoneElse.set(val);
  }

  public readonly contractUserDetails = computed(() => {
    const details = this._caseFormUserDetails();
    const someoneElse = this._isCompletedForSomeoneElse();

    if (someoneElse) {
      return details?.completedFor;
    } else {
      return details?.completedBy;
    }
  });

  // private userInformation = initialUser;

  // public setUserDetails(user: User): void {
  //   this.userInformation = {
  //     ...this.userInformation,
  //     ...user,
  //     userDetails: {
  //       ...this.userInformation.userDetails,
  //       ...user.userDetails,
  //     },
  //   };
  // }
}
