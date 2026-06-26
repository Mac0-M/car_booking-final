import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AllSharedUi } from '../../shared/shared';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ...AllSharedUi],
  templateUrl: './header.html',
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  currentUrl = signal<string>('');

  constructor() {
    this.currentUrl.set(this.router.url);
    this.router.events.subscribe(() => {
      this.currentUrl.set(this.router.url);
    });
  }

  get userName(): string {
    return this.authService.currentUser()?.name || 'Guest';
  }

  get logoLink(): string {
    return this.authService.hasValidToken() ? '/booking/form' : '/auth/login';
  }

  get isLoggedIn(): boolean {
    return this.authService.hasValidToken();
  }

  get isAdmin(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'Admin' || role === 'Super_Admin';
  }

  isAuthPage(): boolean {
    return this.currentUrl().includes('/auth/');
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
