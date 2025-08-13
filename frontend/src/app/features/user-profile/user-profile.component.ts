import { Component, inject, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Case } from '../../shared/types/case';
import { CaseService } from '../../shared/services/case.service';
import { UserService } from '../../shared/services/user.service';
import { CommonModule } from '@angular/common';
import { Flight } from '../../shared/types/flight';
import { TranslatePipe } from '@ngx-translate/core';
import { Card } from 'primeng/card';
import { User } from '../../shared/types/user';

@Component({
  selector: 'app-user-cases-table',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
  imports: [TableModule, CommonModule, TranslatePipe, Card],
})
export class UserProfileComponent implements OnInit {
  private readonly _caseService = inject(CaseService);
  private readonly _userService = inject(UserService);
  public readonly user: User | undefined = this._userService.userDetails();

  public userCases: Case[] = [];

  ngOnInit() {
    this.initializeCases(this.getUserId());
  }

  private initializeCases(userId: string) {
    this._caseService.getAllUserCases(userId).subscribe((data: Case[]) => {
      this.userCases = data.map((c) => ({
        ...c,
        flightNumber: this.getProblematicFlightNumber(c),
        beneficiaryName: this.getBeneficiaryName(c),
      }));
    });
  }

  public getUserFullName(): string {
    if (this.user) {
      return `${this.user.lastName} ${this.user.firstName}`;
    }
    return '';
  }

  private getUserId(): string {
    if (this.user) {
      return this.user.id || '';
    } else {
      return '';
    }
  }

  public getProblematicFlight(givenCase: Case): Flight | undefined {
    if (givenCase.reservation.flights.length === 1) {
      return givenCase.reservation.flights[0];
    } else {
      return givenCase.reservation.flights.find((flight) => flight.problematic);
    }
  }

  public getProblematicFlightNumber(givenCase: Case): string | undefined {
    return this.getProblematicFlight(givenCase)?.flightNumber;
  }

  public mergeFirstAndLastName(givenCase: Case): string {
    return `${givenCase.client.lastName} ${givenCase.client.firstName}`;
  }

  public getBeneficiaryName(givenCase: Case): string {
    const beneficiary = givenCase.beneficiary;
    if (beneficiary) {
      return `${beneficiary.lastName} ${beneficiary.firstName}`;
    }
    return this.mergeFirstAndLastName(givenCase);
  }
}
