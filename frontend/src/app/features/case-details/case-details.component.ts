import { ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CaseService } from '../../shared/services/case.service';
import { Case } from '../../shared/types/case';
import { ActivatedRoute } from '@angular/router';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Statuses } from '../../shared/types/enums/status';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../shared/services/toaster/notification.service';
import {
  CommentDTO,
  CommentService,
  CreateCommentDTO,
} from '../../shared/services/comment.service';
import { UserService } from '../../shared/services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { Button, ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Card, CardModule } from 'primeng/card';
import { Message } from 'primeng/message';
import { Document } from '../../shared/types/document';
import { Tag } from 'primeng/tag';
import { MimeTypeMapper } from '../../shared/helper/mime-type-mappings';
import { FileUpload } from 'primeng/fileupload';
import { PrimeTemplate } from 'primeng/api';
import { DisruptionReasons } from '../../shared/types/enums/disruption-reason';
import { DisruptionReasonMapper } from '../../shared/helper/disruption-reasons-mapper';
import { Dialog } from 'primeng/dialog';
import { ShowIfRoleDirective } from '../../shared/directives/if-roles-directive';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-case-details',
  imports: [
    ProgressSpinner,
    FormsModule,
    CommonModule,
    TranslatePipe,
    ButtonModule,
    InputTextModule,
    CardModule,
    Message,
    Tag,
    Button,
    DatePipe,
    Card,
    FileUpload,
    PrimeTemplate,
    Dialog,
    ShowIfRoleDirective,
    Select,
  ],
  templateUrl: './case-details.component.html',
  styleUrl: './case-details.component.scss',
})
export class CaseDetailsComponent {
  @ViewChild('fileInput') fileInput!: FileUpload;

  private readonly _caseService = inject(CaseService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _translationService = inject(TranslateService);
  private readonly _notificationService = inject(NotificationService);
  private readonly _commentService = inject(CommentService);
  private readonly _userService = inject(UserService);
  private readonly cdr = inject(ChangeDetectorRef);

  public caseData: Case | null = null;
  public loading = true;
  public visible: boolean = false;
  public selectedStatus: Statuses | undefined;
  public statusOptions: { label: string; value: Statuses }[] = [];

  public selectedEmployee: string | undefined;
  public employees: { label: string; value: string }[] = [];

  public comments: CommentDTO[] = [];
  public loadingComments = false;
  public newCommentText = '';
  public postingComment = false;

  @ViewChild('chatMessages') chatMessages!: ElementRef<HTMLDivElement>;

  ngOnInit() {
    this._translationService.onLangChange.subscribe(() => {
      this.buildStatusOptions();
      this.buildEmployeeOptions();
      window.location.reload();
    });
    this.buildStatusOptions();

    const caseId = this._route.snapshot.paramMap.get('caseId');
    if (caseId) {
      this._caseService.getCaseById(caseId).subscribe({
        next: (data) => {
          this.caseData = data;
          this.loading = false;
          this.loadComments();
          let caseId = this.caseData?.id;
          if (caseId) {
            this.getDocuments(caseId);
          }
          this.buildEmployeeOptions();
        },
        error: () => {
          this.loading = false;
        },
      });
    } else {
      this.loading = false;
    }
  }

  public showDialog(): void {
    this.visible = true;
  }

  public onStatusClear(): void {
    this.selectedStatus = undefined;
  }

  public onEmployeeClear(): void {
    this.selectedEmployee = undefined;
  }

  public get currentUserId(): string | null {
    const user = this._userService.userDetails();
    return user?.id ?? null;
  }

  private buildStatusOptions(): void {
    this.statusOptions = Object.values(Statuses).map((status) => ({
      label: this.getStatusTranslation(status as Statuses),
      value: status,
    }));
  }

  private buildEmployeeOptions(): void {
    const assignedEmployeeId = this.caseData?.assignedColleague?.id;
    this._userService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees = employees
          .filter((employee) => !!employee.id && employee.id !== assignedEmployeeId)
          .map((employee) => ({
            label: `${employee.firstName} ${employee.lastName}`,
            value: employee.id!,
          }));
      },
      error: (error: Error) => {
        this._notificationService.showError(error.message);
      },
    });
  }

  public getStatusTranslation(status: Statuses | undefined): string {
    if (status) {
      return this._translationService.instant('statuses.' + status);
    }
    return '';
  }

  public getDisruptionTranslation(disruption: DisruptionReasons) {
    return DisruptionReasonMapper.getTranslationKey(disruption);
  }

  public extractEmployeeName(caseItem: Case): string {
    return caseItem.assignedColleague
      ? `${caseItem.assignedColleague.firstName} ${caseItem.assignedColleague.lastName}`
      : '\u2014';
  }

  public extractClientName(caseItem: Case): string {
    return caseItem.client
      ? `${caseItem.client.firstName} ${caseItem.client.lastName}`
      : this._translationService.instant('case-details.no-client');
  }

  public getStatusSeverity(status: Statuses): string {
    switch (status) {
      case Statuses.ARCHIVED:
        return 'secondary';
      case Statuses.COMPLETED:
        return 'success';
      case Statuses.VALID:
        return 'contrast';
      case Statuses.FAILED:
        return 'danger';
      case Statuses.INVALID:
        return 'warn';
      case Statuses.ASSIGNED:
        return 'info';
    }
  }

  public uploadDocument(event: any): void {
    const file = event.files[0];
    if (file && this.caseData?.id) {
      this._caseService.uploadDocument(this.caseData.id, file, file.name, file.type).subscribe({
        next: () => {
          if (this.caseData?.id) {
            this.getDocuments(this.caseData.id);
            window.location.reload();
          }
        },
        error: (error) => {
          const apiError = error?.error;
          this._notificationService.showError(this._translationService.instant(apiError.detail));
        },
      });
      this.fileInput.uploadedFiles = [];
      /*fileInput.value = '';*/
    } else {
      this._notificationService.showError(
        this._translationService.instant('case-details.select-file-error')
      );
    }
  }

  public getDocuments(caseId: string): void {
    this._caseService.getDocumentList(caseId).subscribe({
      next: (documents: Document[]) => {
        this.caseData!.documentList = documents;
      },
      error: (error) => {
        const apiError = error?.error;
        this._notificationService.showError(this._translationService.instant(apiError.detail));
      },
    });
  }

  public downloadDocument(documentId: string): void {
    this._caseService.getDocument(documentId).subscribe({
      next: (doc: Document) => {
        const mimeType = MimeTypeMapper.mapDocumentTypeToMimeType(doc.type);
        if (!mimeType) {
          this._notificationService.showError('Unsupported document type');
          return;
        }
        const base64Data = doc.contentBase64.replace(/^data:.+;base64,/, '');
        const binaryContent = atob(base64Data);
        const byteNumbers = new Uint8Array(binaryContent.length);
        for (let i = 0; i < binaryContent.length; i++) {
          byteNumbers[i] = binaryContent.charCodeAt(i);
        }
        const url = window.URL.createObjectURL(new Blob([byteNumbers], { type: doc.type }));
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.name; // Use the document name for the file
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        const apiError = error?.error;
        this._notificationService.showError(this._translationService.instant(apiError.detail));
      },
    });
  }

  public loadComments(): void {
    if (!this.caseData?.id) return;
    this.loadingComments = true;
    this._commentService.getComments(this.caseData.id).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.loadingComments = false;
      },
      error: () => {
        this._notificationService.showError(
          this._translationService.instant('api-errors.cannot-load-comments')
        );
        this.loadingComments = false;
      },
    });
  }

  private scrollToBottom(): void {
    if (this.chatMessages) {
      this.chatMessages.nativeElement.scrollTop = this.chatMessages.nativeElement.scrollHeight;
    }
  }

  public postComment(userId: string): void {
    if (!this.newCommentText.trim() || !this.caseData?.id) return;
    this.postingComment = true;
    const comment: CreateCommentDTO = {
      userId,
      text: this.newCommentText,
      timestamp: new Date().toISOString(),
    };
    this._commentService.addCommentToCase(this.caseData.id, comment).subscribe({
      next: (createdComment) => {
        this.comments.push(createdComment);
        this.newCommentText = '';
        this.postingComment = false;

        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: () => {
        this._notificationService.showError(
          this._translationService.instant('api-errors.cannot-post-comment')
        );
        this.postingComment = false;
      },
    });
  }

  public updateCaseStatus(): void {
    if (!this.caseData?.id || !this.selectedStatus) return;

    this._caseService.updateCaseStatus(this.caseData.id, this.selectedStatus).subscribe({
      next: (updatedCase) => {
        if (updatedCase) {
          this.caseData!.status = this.selectedStatus;
          this.selectedStatus = undefined;
          this._notificationService.showSuccess(
            this._translationService.instant('case-details.actions.status-update-success')
          );
        }
      },
      error: (error: Error) => {
        this._notificationService.showError(error.message);
      },
    });
  }

  public updateAssignedEmployee(): void {
    if (!this.caseData?.id || !this.selectedEmployee) return;

    this._caseService.updateAssignedEmployee(this.caseData.id, this.selectedEmployee).subscribe({
      next: (updatedCase) => {
        if (updatedCase) {
          this.caseData!.assignedColleague = updatedCase.assignedColleague;
          this.caseData!.status = updatedCase.status;
          this.selectedEmployee = undefined;
          this._notificationService.showSuccess(
            this._translationService.instant('case-details.actions.employee-update-success')
          );
        }
      },
      error: (error) => {
        const apiError = error?.error;
        this._notificationService.showError(this._translationService.instant(apiError.detail));
      },
    });
  }
}
