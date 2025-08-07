import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { Fieldset } from 'primeng/fieldset';
import { TranslatePipe } from '@ngx-translate/core';

import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-home-page',
  imports: [Button, RouterLink, Fieldset, TranslatePipe, FooterComponent, NavbarComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {}
