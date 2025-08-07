import {
  Directive,
  effect,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

@Directive({
  selector: '[ifAuthenticated]',
})
export class IfAuthenticatedDirective {
  private readonly _templateRef = inject(TemplateRef);
  private readonly _viewContainerRef = inject(ViewContainerRef);

  private _hasView = false;
  public ifAuthenticated = input.required<boolean>();

  constructor() {
    effect(() => {
      const isAuthenticated = this.ifAuthenticated();
      if (isAuthenticated && !this._hasView) {
        this._viewContainerRef.createEmbeddedView(this._templateRef);
        this._hasView = true;
      } else {
        this._viewContainerRef.clear();
        this._hasView = false;
      }
    });
  }
}
