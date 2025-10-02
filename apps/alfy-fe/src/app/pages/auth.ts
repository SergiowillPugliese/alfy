import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthStateService, LoginDto, RegisterDto } from '@alfy/alfy-shared-lib';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

interface AuthFormValue {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface ApiError {
  error?: {
    message?: string;
  };
  message?: string;
  status?: number;
}

@Component({
  selector: 'app-auth',
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authStateService = inject(AuthStateService);
  private router = inject(Router);

  authForm!: FormGroup;
  isLoginMode = true;
  errorMessage = '';
  isLoading = false;
  
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeForm();
    
    // Subscribe to auth state changes
    this.authStateService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        this.isLoading = authState.loading;
        
        if (authState.isAuthenticated) {
          this.router.navigate(['/dashboard']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: [''],
      lastName: ['']
    });

    this.updateFormValidators();
  }

  private updateFormValidators(): void {
    const firstNameControl = this.authForm.get('firstName');
    const lastNameControl = this.authForm.get('lastName');

    if (this.isLoginMode) {
      firstNameControl?.clearValidators();
      lastNameControl?.clearValidators();
    } else {
      firstNameControl?.setValidators([Validators.required]);
      lastNameControl?.setValidators([Validators.required]);
    }

    firstNameControl?.updateValueAndValidity();
    lastNameControl?.updateValueAndValidity();
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.updateFormValidators();
    
    // Reset form values for fields that are not needed
    if (this.isLoginMode) {
      this.authForm.patchValue({
        firstName: '',
        lastName: ''
      });
    }
  }

  onSubmit(): void {
    if (this.authForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.errorMessage = '';
    const formValue = this.authForm.value as AuthFormValue;

    if (this.isLoginMode) {
      this.login(formValue);
    } else {
      this.register(formValue);
    }
  }

  private login(formData: AuthFormValue): void {
    // Send only email and password for login
    const loginData: LoginDto = {
      email: formData.email,
      password: formData.password
    };

    this.authStateService.login(loginData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Navigation handled by auth state subscription
            console.log('Login successful');
          } else {
            this.errorMessage = response.error || 'Errore durante il login';
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.errorMessage = this.getErrorMessage(error);
        }
      });
  }

  private register(formData: AuthFormValue): void {
    // Send all required fields for registration
    const registerData: RegisterDto = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName
    };

    this.authStateService.register(registerData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Navigation handled by auth state subscription
            console.log('Registration successful');
          } else {
            this.errorMessage = response.error || 'Errore durante la registrazione';
          }
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.errorMessage = this.getErrorMessage(error);
        }
      });
  }

  private getErrorMessage(error: ApiError): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    if (error?.status === 409) {
      return 'Un utente con questa email esiste già';
    }
    if (error?.status === 401) {
      return 'Credenziali non valide';
    }
    return 'Si è verificato un errore. Riprova più tardi.';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.authForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markFormGroupTouched(): void {
    Object.keys(this.authForm.controls).forEach(key => {
      const control = this.authForm.get(key);
      control?.markAsTouched();
    });
  }
}
