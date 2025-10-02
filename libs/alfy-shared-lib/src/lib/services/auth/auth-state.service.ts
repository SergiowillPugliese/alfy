import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthenticationService } from '../../api/authentication/authentication.service';
import { 
  AuthResponseDto, 
  LoginDto, 
  RegisterDto, 
  RefreshTokenDto,
  UserProfileDto 
} from '../../api/alfyAPI.schemas';

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfileDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private readonly TOKEN_KEY = 'alfy_access_token';
  private readonly REFRESH_TOKEN_KEY = 'alfy_refresh_token';
  private readonly USER_KEY = 'alfy_user';

  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: false
  });

  public authState$ = this.authStateSubject.asObservable();
  private refreshTimer: any;

  constructor(private authService: AuthenticationService) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const accessToken = localStorage.getItem(this.TOKEN_KEY);
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);
    
    if (accessToken && refreshToken && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.updateAuthState({
          isAuthenticated: true,
          user,
          accessToken,
          refreshToken,
          loading: false
        });
        this.scheduleTokenRefresh();
      } catch (error) {
        this.clearAuthState();
      }
    }
  }

  register(registerData: RegisterDto): Observable<AuthResponseDto> {
    this.setLoading(true);
    return this.authService.authControllerRegister(registerData).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.handleAuthSuccess(response.data);
        }
      }),
      catchError(error => {
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  login(loginData: LoginDto): Observable<AuthResponseDto> {
    this.setLoading(true);
    return this.authService.authControllerLogin(loginData).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.handleAuthSuccess(response.data);
        }
      }),
      catchError(error => {
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<any> {
    this.setLoading(true);
    const currentState = this.authStateSubject.value;
    
    if (!currentState.isAuthenticated) {
      this.clearAuthState();
      return new Observable(observer => {
        observer.next(true);
        observer.complete();
      });
    }

    return this.authService.authControllerLogout().pipe(
      tap(() => this.clearAuthState()),
      catchError(error => {
        // Even if logout fails on server, clear local state
        this.clearAuthState();
        return throwError(() => error);
      })
    );
  }

  refreshToken(): Observable<AuthResponseDto> {
    const currentState = this.authStateSubject.value;
    
    if (!currentState.refreshToken) {
      this.clearAuthState();
      return throwError(() => new Error('No refresh token available'));
    }

    const refreshData: RefreshTokenDto = {
      refresh_token: currentState.refreshToken
    };

    return this.authService.authControllerRefreshTokens(refreshData).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.handleAuthSuccess(response.data);
        }
      }),
      catchError(error => {
        this.clearAuthState();
        return throwError(() => error);
      })
    );
  }

  getProfile(): Observable<UserProfileDto | null> {
    return this.authService.authControllerGetProfile().pipe(
      map(response => {
        if (response.success && response.data) {
          // Update user in state
          const currentState = this.authStateSubject.value;
          this.updateAuthState({
            ...currentState,
            user: response.data
          });
          this.saveUserToStorage(response.data);
          return response.data;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error fetching profile:', error);
        return throwError(() => error);
      })
    );
  }

  private handleAuthSuccess(authData: any): void {
    const { access_token, refresh_token, user } = authData;
    
    this.updateAuthState({
      isAuthenticated: true,
      user,
      accessToken: access_token,
      refreshToken: refresh_token,
      loading: false
    });

    this.saveTokensToStorage(access_token, refresh_token);
    this.saveUserToStorage(user);
    this.scheduleTokenRefresh();
  }

  private updateAuthState(newState: Partial<AuthState>): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({ ...currentState, ...newState });
  }

  private setLoading(loading: boolean): void {
    this.updateAuthState({ loading });
  }

  private clearAuthState(): void {
    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false
    });
    this.clearStorage();
    this.clearRefreshTimer();
  }

  private saveTokensToStorage(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  private saveUserToStorage(user: UserProfileDto): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private clearStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  private scheduleTokenRefresh(): void {
    this.clearRefreshTimer();
    
    // Refresh token every 14 minutes (1 minute before expiry)
    this.refreshTimer = timer(14 * 60 * 1000).subscribe(() => {
      this.refreshToken().subscribe({
        error: (error) => {
          console.error('Auto token refresh failed:', error);
          this.clearAuthState();
        }
      });
    });
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      this.refreshTimer.unsubscribe();
      this.refreshTimer = null;
    }
  }

  // Utility methods
  get currentUser(): UserProfileDto | null {
    return this.authStateSubject.value.user;
  }

  get isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  get accessToken(): string | null {
    return this.authStateSubject.value.accessToken;
  }

  get isLoading(): boolean {
    return this.authStateSubject.value.loading;
  }
}
