import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

// Estado compartido de refresh (módulo-level para ser singleton)
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);

  // Solo interceptar peticiones a nuestra API
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  // No interceptar login ni refresh (evitar bucle infinito)
  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/refresh') ||
    req.url.includes('/auth/logout');

  const token = authService.getToken();
  const authReq = token && !isAuthEndpoint
    ? addToken(req, token)
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      // Solo manejar 401 de endpoints que no sean de auth
      if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthEndpoint) {
        return handle401(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
    withCredentials: true,   // envía cookie httpOnly del refresh token
  });
}

function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshAccessToken().pipe(
      switchMap((newToken) => {
        isRefreshing = false;
        refreshTokenSubject.next(newToken);
        // Reintentar la petición original con el nuevo token
        return next(addToken(req, newToken));
      }),
      catchError((err) => {
        isRefreshing = false;
        refreshTokenSubject.next(null);
        return throwError(() => err);
      })
    );
  }

  // Si ya hay un refresh en curso, encolar la petición hasta que llegue el nuevo token
  return refreshTokenSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token) => next(addToken(req, token)))
  );
}
