import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  throwError,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  initials: string;
}

interface LoginApiResponse {
  accessToken: string;
  usuario: { id: number; nombre: string; email: string; rol: string };
}

// ─── Storage keys ────────────────────────────────────────────────────────────

const TOKEN_KEY    = 'panel-futura-token';
const USER_KEY     = 'panel-futura-user';
const REMEMBER_KEY = 'panel-futura-remember';

// ─── Servicio ────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(null);

  readonly user$ = this.userSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private http: HttpClient,
    private router: Router
  ) {
    this.userSubject.next(this.restoreUser());
  }

  // ── Getters ───────────────────────────────────────────────────────────────

  get currentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUser;
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return (
      localStorage.getItem(TOKEN_KEY) ??
      sessionStorage.getItem(TOKEN_KEY) ??
      null
    );
  }

  // ── Flujos de auth ────────────────────────────────────────────────────────

  /**
   * POST /api/auth/login
   * Guarda el accessToken y los datos del usuario en storage.
   */
  login(payload: LoginPayload): Observable<AuthUser> {
    return this.http
      .post<ApiResponse<LoginApiResponse>>(
        `${this.apiUrl}/auth/login`,
        { email: payload.email, password: payload.password },
        { withCredentials: true }   // recibe cookie httpOnly del refresh token
      )
      .pipe(
        map((res) => {
          const { accessToken, usuario } = res.response;
          const authUser = this.buildUser(usuario);
          this.persist(accessToken, authUser, payload.remember);
          return authUser;
        }),
        catchError((err) => {
          const msg =
            err?.error?.message ?? 'Error al iniciar sesión. Intenta de nuevo.';
          return throwError(() => new Error(msg));
        })
      );
  }

  /**
   * POST /api/auth/refresh
   * Rota el access token usando la cookie httpOnly del refresh token.
   * Llamado automáticamente por el interceptor cuando recibe 401.
   */
  refreshAccessToken(): Observable<string> {
    return this.http
      .post<ApiResponse<{ accessToken: string }>>(
        `${this.apiUrl}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      .pipe(
        map((res) => {
          const token = res.response.accessToken;
          this.updateStoredToken(token);
          return token;
        }),
        catchError((err) => {
          // Si el refresh falla la sesión expiró; limpiar y redirigir
          this.clearSession();
          this.router.navigate(['/login']);
          return throwError(() => err);
        })
      );
  }

  /**
   * POST /api/auth/logout
   * Revoca el refresh token en el servidor y limpia el storage local.
   */
  logout(): void {
    this.http
      .post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(catchError(() => [null]))
      .subscribe(() => {
        this.clearSession();
        this.router.navigate(['/login']);
      });
  }

  // ── Storage ───────────────────────────────────────────────────────────────

  private persist(token: string, user: AuthUser, remember: boolean): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.userSubject.next(user);
      return;
    }

    const keep  = remember ? localStorage   : sessionStorage;
    const clear = remember ? sessionStorage  : localStorage;

    clear.removeItem(TOKEN_KEY);
    clear.removeItem(USER_KEY);

    keep.setItem(TOKEN_KEY, token);
    keep.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(REMEMBER_KEY, String(remember));

    this.userSubject.next(user);
  }

  private updateStoredToken(token: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const remember = localStorage.getItem(REMEMBER_KEY) !== 'false';
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  }

  private clearSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      [localStorage, sessionStorage].forEach((s) => {
        s.removeItem(TOKEN_KEY);
        s.removeItem(USER_KEY);
      });
      localStorage.removeItem(REMEMBER_KEY);
    }
    this.userSubject.next(null);
  }

  private restoreUser(): AuthUser | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const raw =
      localStorage.getItem(USER_KEY) ??
      sessionStorage.getItem(USER_KEY) ??
      null;

    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      this.clearSession();
      return null;
    }
  }

  // ── Builder ───────────────────────────────────────────────────────────────

  private buildUser(u: LoginApiResponse['usuario']): AuthUser {
    const name = u.nombre?.trim() || u.email.split('@')[0];
    const initials =
      name
        .split(' ')
        .slice(0, 2)
        .map((p) => p.charAt(0).toUpperCase())
        .join('') || 'AD';

    return { id: u.id, name, email: u.email, role: u.rol, initials };
  }
}
