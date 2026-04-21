import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Hero, HeroRequest } from '../models/hero.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HeroApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/heroes`;

  getAll() {
    return this.http.get<Hero[]>(this.base);
  }

  getById(id: string) {
    return this.http.get<Hero>(`${this.base}/${id}`);
  }

  create(request: HeroRequest) {
    return this.http.post<Hero>(this.base, request);
  }

  update(id: string, request: HeroRequest) {
    return this.http.put<Hero>(`${this.base}/${id}`, request);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
