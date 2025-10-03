
// Esporta tutto dalla lib originale
export * from './alfy-shared-lib';
export * from './types/auth.types';

// Export dei servizi API generati da orval
export * from './api/shopping-list/shopping-list.service';
export * from './api/app/app.service';
export * from './api/authentication-login-only/authentication-login-only.service';
export * from './api/bootstrap/bootstrap.service';
export * from './api/sysadmin-dashboard/sysadmin-dashboard.service';
export * from './api/admin-dashboard/admin-dashboard.service';
export * from './api/family-management-internal/family-management-internal.service';
export * from './api/alfyAPI.schemas';

// Export servizi toast
export * from './services/toast/toast.service';
export * from './services/toast/toast.model';

// Export servizi auth
export * from './services/auth/auth-state.service';

// Export interceptors
export * from './interceptors/error.interceptor';
export { authInterceptor } from './interceptors/auth.interceptor';

// Export guards
export { authGuard } from './guards/auth.guard';
export { noAuthGuard } from './guards/no-auth.guard';

// Export componenti
export * from './components/option-bar/option-bar.component';