import { Component, input } from '@angular/core';
import { MessageModule } from 'primeng/message';

// Component for error message with custom input
// Import in form to use <app-error-message />

@Component({
  selector: 'app-error-message',
  imports: [MessageModule],
  template: ` <p-message severity="error" variant="simple" size="small" [text]="text()" /> `,
})
export class ErrorMessageComponent {
  public text = input.required<string>();
}
