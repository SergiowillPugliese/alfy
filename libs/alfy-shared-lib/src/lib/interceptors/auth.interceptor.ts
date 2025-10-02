import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthStateService } from '../services/auth/auth-state.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthStateService);

  // Don't add token to auth endpoints (except logout and profile)
  const skipUrls = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];
  const shouldSkip = skipUrls.some(url => req.url.includes(url));

  if (shouldSkip) {
    return next(req);
  }

  // Add token to request
  const token = authService.accessToken;
  const authReq = token 
    ? req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Try to refresh token
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Retry with new token
            const newToken = authService.accessToken;
            const retryReq = newToken
              ? req.clone({
                  headers: req.headers.set('Authorization', `Bearer ${newToken}`)
                })
              : req;
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // Refresh failed, logout user
            authService.logout().subscribe();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
