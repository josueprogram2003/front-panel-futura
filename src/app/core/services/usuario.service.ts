import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'editor' | 'viewer';
  isActive: boolean | number;
  intentos_fallidos: number;
  bloqueado_hasta: string | null;
  ultimo_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUsuarioPayload {
  nombre: string;
  email: string;
  password: string;
  rol: string;
}

export interface UpdateUsuarioPayload {
  nombre: string;
  email: string;
  rol: string;
}

// ─── Servicio ────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/usuarios`;

  getAll(): Observable<Usuario[]> {
    return this.http
      .get<ApiResponse<Usuario[]>>(this.base)
      .pipe(map((r) => r.response));
  }

  create(payload: CreateUsuarioPayload): Observable<Usuario> {
    return this.http
      .post<ApiResponse<Usuario>>(this.base, payload)
      .pipe(map((r) => r.response));
  }

  update(id: number, payload: UpdateUsuarioPayload): Observable<Usuario> {
    return this.http
      .put<ApiResponse<Usuario>>(`${this.base}/${id}`, payload)
      .pipe(map((r) => r.response));
  }

  changePassword(id: number, password: string): Observable<void> {
    return this.http
      .patch<ApiResponse<void>>(`${this.base}/${id}/password`, { password })
      .pipe(map(() => void 0));
  }

  toggleActive(id: number): Observable<{ isActive: boolean }> {
    return this.http
      .patch<ApiResponse<{ isActive: boolean }>>(`${this.base}/${id}/toggle`, {})
      .pipe(map((r) => r.response));
  }

  remove(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.base}/${id}`)
      .pipe(map(() => void 0));
  }
}
