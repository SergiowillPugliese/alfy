// libs/alfy-shared-lib/src/lib/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast/toast.service';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      toastService.showHttpError({
        url: req.url,
        method: req.method,
        status: error.status,
        message: error.message
      });
      return throwError(() => error);
    })
  );
};