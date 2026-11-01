import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Task, TaskPayload } from './task.model';

/** Seule classe qui connaît l'URL et les verbes HTTP de l'API. */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/tasks';

  getAll(): Observable<Task[]> {
    return this.http.get<Task[]>(this.url);
  }

  create(payload: TaskPayload): Observable<Task> {
    return this.http.post<Task>(this.url, payload);
  }

  update(id: number, payload: TaskPayload): Observable<Task> {
    return this.http.put<Task>(`${this.url}/${id}`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
