import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy, inject } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { AuthStateService, UserProfileDto } from "@alfy/alfy-shared-lib";
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, CardModule, ButtonModule, AvatarModule],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage implements OnInit, OnDestroy {
  private authStateService = inject(AuthStateService);
  private router = inject(Router);

  currentUser: UserProfileDto | null = null;
  isLoading = false;
  
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Subscribe to auth state changes
    this.authStateService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        this.currentUser = authState.user;
        this.isLoading = authState.loading;
        
        if (!authState.isAuthenticated) {
          this.router.navigate(['/auth']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onLogout(): void {
    this.authStateService.logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Logout successful');
          // Navigation handled by auth state subscription
        },
        error: (error) => {
          console.error('Logout error:', error);
          // Even if logout fails, redirect to auth
          this.router.navigate(['/auth']);
        }
      });
  }
}
