import { Component, inject, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { Fieldset } from 'primeng/fieldset';
import { TranslatePipe } from '@ngx-translate/core';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ContractService } from '../../shared/services/contract.service';
import FileSaver from 'file-saver';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-home-page',
  imports: [Button, RouterLink, Fieldset, TranslatePipe, FooterComponent, NavbarComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements OnInit {
  //TODO move this in confirmation component
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
