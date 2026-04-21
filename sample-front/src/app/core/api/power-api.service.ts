import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Power, PowerRequest } from '../models/power.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PowerApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/powers`;

  getAll() {
    return this.http.get<Power[]>(this.base);
  }

  getById(id: string) {
    return this.http.get<Power>(`${this.base}/${id}`);
  }

  create(request: PowerRequest) {
    return this.http.post<Power>(this.base, request);
  }

  update(id: string, request: PowerRequest) {
    return this.http.put<Power>(`${this.base}/${id}`, request);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
