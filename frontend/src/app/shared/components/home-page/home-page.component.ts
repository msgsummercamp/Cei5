import { Component } from '@angular/core';
import {Button} from 'primeng/button';
import {RouterLink} from '@angular/router';
import { Fieldset } from 'primeng/fieldset';

@Component({
  selector: 'app-home-page',
  imports: [Button, RouterLink, Fieldset],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {}
