import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly _messageService = inject(MessageService);
  private readonly _translationService = inject(TranslateService);

  /**
   * Displays a success notification with the given message.
   * @param message The message to display in the notification.
   */
  public showSuccess(message: string): void {
    this._messageService.add({
      severity: 'success',
      summary: this._translationService.instant('notifications.success'),
      detail: message,
      sticky: true,
    });
  }

  /**
   * Displays an error notification with the given message.
   * @param message The message to display in the notification.
   */
  public showError(message: string): void {
    this._messageService.add({
      severity: 'error',
      summary: this._translationService.instant('notifications.error'),
      detail: message,
      sticky: true,
    });
  }

  /**
   * Displays an informational notification with the given message.
   * @param message The message to display in the notification.
   */
  public showInfo(message: string): void {
    this._messageService.add({
      severity: 'info',
      summary: this._translationService.instant('notifications.info'),
      detail: message,
      sticky: true,
    });
  }

  /**
   * Displays a warning notification with the given message.
   * @param message The message to display in the notification.
   */
  public showWarn(message: string): void {
    this._messageService.add({
      severity: 'warn',
      summary: this._translationService.instant('notifications.warning'),
      detail: message,
      sticky: true,
    });
  }
}
