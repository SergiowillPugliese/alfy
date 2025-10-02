import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, take } from 'rxjs';
import { AuthStateService } from '../services/auth/auth-state.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthStateService);
  const router = inject(Router);

  console.log('authGuard');

  return authService.authState$.pipe(
    take(1),
    map(authState => {
      if (authState.isAuthenticated) {
        return true;
      }
      
      // Redirect to login page
      return router.createUrlTree(['/auth']);
    })
  );
};
