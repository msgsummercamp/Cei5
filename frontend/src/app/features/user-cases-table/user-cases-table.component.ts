import { Component, inject, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Case } from '../../shared/types/case';
import { CaseService } from '../../shared/services/case.service';
import { UserService } from '../../shared/services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-cases-table',
  templateUrl: './user-cases-table.component.html',
  styleUrl: './user-cases-table.component.scss',
  imports: [TableModule, CommonModule],
})
export class UserCasesTableComponent implements OnInit {
  private readonly _caseService = inject(CaseService);
  private readonly _userService = inject(UserService);
  public userCases: Case[] = [];

  ngOnInit() {
    this.initializeCases(this.getUserId());
  }

  private initializeCases(userId: string) {
    this._caseService.getAllUserCases(userId).subscribe((data: Case[]) => {
      this.userCases = data;
    });
  }

  private getUserId(): string {
    const userDetails = this._userService.userDetails();
    return userDetails?.id || '';
  }
}
