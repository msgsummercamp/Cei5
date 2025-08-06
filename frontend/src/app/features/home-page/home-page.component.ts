import { Component, inject, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Fieldset } from 'primeng/fieldset';
import { TranslatePipe } from '@ngx-translate/core';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ContractService } from '../../shared/services/contract.service';

@Component({
  selector: 'app-home-page',
  imports: [Button, RouterLink, Fieldset, TranslatePipe, FooterComponent, RouterOutlet],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements OnInit {
  ngOnInit(): void {
    this._contractService.contract$.subscribe((data) => {
      console.log(data);
    });
  }
  private _contractService = inject(ContractService);

  getContract() {
    this._contractService.generateContract('contract');
  }
}
