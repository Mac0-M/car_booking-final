import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { AllSharedUi } from '../../shared/shared';
import { AuthService } from '../../core/services/auth.service';
import { HeaderService } from '../../core/services/header.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, ...AllSharedUi],
  templateUrl: './header.html',
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  public readonly headerService = inject(HeaderService);

  currentUrl = signal<string>('');
  isMobileMenuOpen = signal<boolean>(false);
  isProfileDropdownOpen = signal<boolean>(false);

  @HostListener('window:click')
  closeDropdowns(): void {
    this.isProfileDropdownOpen.set(false);
  }

  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen.update((open) => !open);
  }

  closeProfileDropdown(): void {
    this.isProfileDropdownOpen.set(false);
  }

  constructor() {
    this.currentUrl.set(this.router.url);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(event.urlAfterRedirects || event.url);
        this.isMobileMenuOpen.set(false);
      }
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  get userName(): string {
    return this.authService.currentUser()?.name || 'Guest';
  }

  get profileImage(): string {
    const user = this.authService.currentUser();
    if (!user || !user.profile_image) {
      return '';
    }
    if (user.profile_image.startsWith('http')) {
      return user.profile_image;
    }
    const baseUrl = environment.apiUrl.replace('/api/v1', '');
    const imgPath = user.profile_image.startsWith('/') ? user.profile_image : `/${user.profile_image}`;
    return `${baseUrl}${imgPath}`;
  }

  get logoLink(): string {
    return this.authService.hasValidToken() ? '/bookings' : '/auth/login';
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

  isRouteActive(path: string): boolean {
    const url = this.currentUrl().split('?')[0].split('#')[0];
    const active = url === path;
    console.log(`[isRouteActive] path: ${path}, url: ${url}, active: ${active}`);
    return active;
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
