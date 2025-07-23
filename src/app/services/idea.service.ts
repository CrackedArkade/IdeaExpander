import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Idea } from '../models/idea.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IdeaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // 💾 Get all ideas
  getIdeas(): Observable<Idea[]> {
    return this.http.get<Idea[]>(`${this.apiUrl}/ideas`);
  }

  // 🧠 Add a new idea
  addIdea(title: string, content: string): Observable<Idea> {
  return this.http.post<Idea>(`${this.apiUrl}/ideas`, { title, content: content });
  }


  // 🤖 Expand with AI
  expandWithAI(id: number): Observable<{ id: number; expanded: string }> {
    return this.http.post<{ id: number; expanded: string }>(
      `${this.apiUrl}/ideas/${id}/ai-expand`,
      null
    );
  }

  // ❌ Delete idea
  deleteIdea(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/ideas/${id}`);
  }
  updateIdea(id: number, title: string, content: string): Observable<Idea> {
    return this.http.put<Idea>(`${this.apiUrl}/ideas/${id}`, { title, content });
  }
  summarizeExpansion(id: number, chatMessages: { sender: string; content: string }[]) {
    return this.http.post<string>(`${this.apiUrl}/ideas/${id}/ai-expand`, chatMessages);
  }
  // src/app/services/idea.service.ts
  sendMessageToAI(ideaId: number, message: string) {
    return this.http.post<{ id: number; expanded: string }>(
      `${this.apiUrl}/ideas/${ideaId}/ai-chat`,
      { message }
    );
  }

}
