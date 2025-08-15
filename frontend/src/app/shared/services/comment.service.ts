import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export type CommentDTO = {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
  username: string;
};

export type CreateCommentDTO = {
  userId: string;
  text: string;
  timestamp: string;
};

@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly _apiUrl = environment.API_URL;
  private readonly _http = inject(HttpClient);

  public getComments(caseId: string): Observable<CommentDTO[]> {
    return this._http.get<CommentDTO[]>(`${this._apiUrl}/comments/case/${caseId}`);
  }

  public addCommentToCase(caseId: string, comment: CreateCommentDTO): Observable<CommentDTO> {
    return this._http.post<CommentDTO>(`${this._apiUrl}/comments/case/${caseId}`, comment);
  }
}
