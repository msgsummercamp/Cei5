import { Component, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { Router } from '@angular/router';
import { Fieldset } from 'primeng/fieldset';
import { TranslatePipe } from '@ngx-translate/core';

import { FooterComponent } from '../../shared/components/footer/footer.component';
import { StepNavigationService } from '../../shared/services/step-navigation.service';

@Component({
  selector: 'app-home-page',
  imports: [Button, Fieldset, TranslatePipe, FooterComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  private readonly router = inject(Router);
  private readonly _stepNavigationService = inject(StepNavigationService);

  public navigateToForm(): void {
    this._stepNavigationService.resetToFirstStep();
    this.router.navigate(['/form']);
  }
}
