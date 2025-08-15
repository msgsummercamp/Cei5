import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-forbidden-page',
  imports: [TranslatePipe, Button],
  templateUrl: './forbidden-page.component.html',
  styleUrl: './forbidden-page.component.scss',
})
export class ForbiddenPageComponent {
  private readonly _router = inject(Router);

  public goToHome(): void {
    this._router.navigate(['/']);
  }
}
