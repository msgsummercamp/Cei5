import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-not-found',
  imports: [Button, TranslatePipe],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  private readonly _router = inject(Router);

  public goToHome(): void {
    this._router.navigate(['/']);
  }
}
