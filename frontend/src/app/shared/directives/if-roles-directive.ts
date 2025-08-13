import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

@Directive({
  selector: '[showIfRole]',
})
export class ShowIfRoleDirective {
  private readonly _templateRef = inject(TemplateRef);
  private readonly _viewContainerRef = inject(ViewContainerRef);
  public readonly _authService = inject(AuthService);

  private _hasView = false;

  public showIfRole = input.required<string[]>();

  constructor() {
    effect(() => {
      const userRole = this._authService.userRole();
      const shouldShow = this.showIfRole().includes(userRole);
      if (shouldShow && !this._hasView) {
        this._viewContainerRef.createEmbeddedView(this._templateRef);
        this._hasView = true;
      } else {
        this._viewContainerRef.clear();
        this._hasView = false;
      }
    });
  }
}
