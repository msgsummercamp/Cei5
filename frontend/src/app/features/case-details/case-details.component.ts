import { Component, inject } from '@angular/core';
import { CaseService } from '../../shared/services/case.service';
import { Case } from '../../shared/types/case';
import { ActivatedRoute } from '@angular/router';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Statuses } from '../../shared/types/enums/status';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { NotificationService } from '../../shared/services/toaster/notification.service';
import {
  CommentDTO,
  CommentService,
  CreateCommentDTO,
} from '../../shared/services/comment.service';
import { UserService } from '../../shared/services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';

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
  ],
  templateUrl: './case-details.component.html',
  styleUrl: './case-details.component.scss',
})
export class CaseDetailsComponent {
  private readonly _caseService = inject(CaseService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _translationService = inject(TranslateService);
  private readonly _notificationService = inject(NotificationService);
  private readonly _commentService = inject(CommentService);
  private readonly _userService = inject(UserService);

  public caseData: Case | null = null;
  public loading = true;

  public comments: CommentDTO[] = [];
  public loadingComments = false;
  public newCommentText = '';
  public postingComment = false;

  ngOnInit() {
    const caseId = this._route.snapshot.paramMap.get('caseId');
    if (caseId) {
      this._caseService.getCaseById(caseId).subscribe({
        next: (data) => {
          this.caseData = data;
          this.loading = false;
          this.loadComments();
        },
        error: () => {
          this.loading = false;
        },
      });
    } else {
      this.loading = false;
    }
  }

  public get currentUserId(): string | null {
    const user = this._userService.userDetails();
    return user?.id ?? null;
  }

  public getStatusTranslation(status: Statuses): string {
    return this._translationService.instant('statuses.' + status);
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
        this.loadingComments = false;
      },
    });
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
      },
      error: () => {
        this.postingComment = false;
      },
    });
  }
}
