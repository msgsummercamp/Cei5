import { Component, inject, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import FileSaver from 'file-saver';
import { ContractService } from '../../../../shared/services/contract.service';
import { ScrollPanel } from 'primeng/scrollpanel';

type ContractDetails = {
  caseId: string;
  caseDate: string;
  firstName: string;
  lastName: string;
  address: string;
  postalCode: string;
  reservationNumber: string;
  email: string;
};

@Component({
  selector: 'app-confirmation-form',
  imports: [TranslatePipe, Card, Button, ScrollPanel],
  templateUrl: './confirmation.component-form.html',
  styleUrl: './confirmation.component-form.scss',
})
export class ConfirmationFormComponent implements OnInit {
  ngOnInit(): void {
    this._contractService.contract$.subscribe((data) => {
      FileSaver.saveAs(data, 'contract');
    });
  }
  private _contractService = inject(ContractService);

  getContract() {
    this._contractService.generateContract('contract');
  }
}
