import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly messageService = inject(MessageService);

  /**
   * Displays a success notification with the given message.
   * @param message The message to display in the notification.
   */
  public showSuccess(message: string): void {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
  }

  /**
   * Displays an error notification with the given message.
   * @param message The message to display in the notification.
   */
  public showError(message: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }

  /**
   * Displays an informational notification with the given message.
   * @param message The message to display in the notification.
   */
  public showInfo(message: string): void {
    this.messageService.add({ severity: 'info', summary: 'Info', detail: message });
  }

  /**
   * Displays a warning notification with the given message.
   * @param message The message to display in the notification.
   */
  public showWarn(message: string): void {
    this.messageService.add({ severity: 'warn', summary: 'Warning', detail: message });
  }
}
