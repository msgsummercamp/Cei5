import { Component, inject, ViewChild } from '@angular/core';
import { CaseService } from '../../shared/services/case.service';
import { Case } from '../../shared/types/case';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Statuses } from '../../shared/types/enums/status';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../shared/services/toaster/notification.service';
import { Document } from '../../shared/types/document';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { DatePipe } from '@angular/common';
import { Card } from 'primeng/card';
import { MimeTypeMapper } from '../../shared/helper/mime-type-mappings';
import { FileUpload } from 'primeng/fileupload';
import { PrimeTemplate } from 'primeng/api';

@Component({
  selector: 'app-case-details',
  imports: [ProgressSpinner, TranslatePipe, Tag, Button, DatePipe, Card, FileUpload, PrimeTemplate],
  templateUrl: './case-details.component.html',
  styleUrl: './case-details.component.scss',
})
export class CaseDetailsComponent {
  @ViewChild('fileInput') fileInput!: FileUpload;

  private readonly _caseService = inject(CaseService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _translationService = inject(TranslateService);
  private readonly _notificationService = inject(NotificationService);
  private readonly _router = inject(Router);
  private readonly _translateService = inject(TranslateService);

  public caseData: Case | null = null;
  public loading = true;
  public fileUploadMessages = {
    invalidFileSizeMessageSummary: '',
    invalidFileSizeMessageDetail: '',
    invalidFileTypeMessageSummary: '',
  };

  ngOnInit() {
    this._translateService.onLangChange.subscribe(() => {
      window.location.reload();
    });
    const caseId = this._route.snapshot.paramMap.get('caseId');
    if (caseId) {
      this._caseService.getCaseById(caseId).subscribe({
        next: (data) => {
          this.caseData = data;
          this.loading = false;
          let caseId = this.caseData?.id;
          if (caseId) {
            this.getDocuments(caseId);
          }
        },
        error: () => {
          this.loading = false;
        },
      });
    } else {
      this.loading = false;
    }
  }

  public getStatusTranslation(status: Statuses | undefined): string {
    if (status) {
      return this._translationService.instant('statuses.' + status);
    }
    return '';
  }

  public extractEmployeeName(caseItem: Case): string {
    return caseItem.assignedColleague
      ? `${caseItem.assignedColleague.firstName} ${caseItem.assignedColleague.lastName}`
      : '\u2014';
  }

  public handleUpload() {
    this.fileInput.upload();
  }

  public uploadDocument(event: any): void {
    const file = event.files[0];
    if (file && this.caseData?.id) {
      this._caseService.uploadDocument(this.caseData.id, file, file.name, file.type).subscribe({
        next: () => {
          this._notificationService.showSuccess(
            this._translationService.instant('caseDetails.documentUploadSuccess')
          );
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
        this._translationService.instant('caseDetails.selectFileError')
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
        console.log('Binary content:', doc);
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
}
