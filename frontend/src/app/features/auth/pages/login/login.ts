import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AllSharedUi } from '../../../../shared/shared';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

/**
 * LoginComponent: Login page (/auth/login)
 * - Email + Password form for Local Login
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ...AllSharedUi],
  templateUrl: './login.html'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  emailError = '';
  passwordError = '';

  constructor() {}

  /** Validate form inputs */
  validate(): boolean {
    let isValid = true;

    if (!this.email) {
      this.emailError = 'Email is required';
      isValid = false;
    } else if (!this.isValidEmail(this.email)) {
      this.emailError = 'Please enter a valid email address';
      isValid = false;
    } else {
      this.emailError = '';
    }

    if (!this.password) {
      this.passwordError = 'Password is required';
      isValid = false;
    } else {
      this.passwordError = '';
    }

    return isValid;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /** Login with Email + Password */
  onSubmitLocal(): void {
    if (!this.validate()) {
      return;
    }
    console.log('Logging in with email:', this.email);
    this.authService.loginLocal(this.email, this.password).subscribe({
      next: (res) => {
        console.log('Login successful:', res);
        this.router.navigate(['/bookings']);
      },
      error: (err) => {
        alert(err.error?.message || 'Invalid email or password');
      }
    });
  }
}
