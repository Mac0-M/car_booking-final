import { Component, OnInit, inject, signal, computed, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AllSharedUi } from '../../../../shared/shared';
import { AuthService } from '../../../../core/services/auth.service';
import { VehicleListComponent } from '../vehicle-list/vehicle-list';
import { UserListComponent } from '../user-list/user-list';
import { DirectoryLeftSidebarComponent } from '../../components/directory-left-sidebar/directory-left-sidebar';

@Component({
  selector: 'app-directory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSidenavModule,
    VehicleListComponent,
    UserListComponent,
    DirectoryLeftSidebarComponent,
    ...AllSharedUi
  ],
  templateUrl: './directory.html',
})
export class DirectoryComponent implements OnInit {
  private readonly authService = inject(AuthService);
  readonly router = inject(Router);

  @ViewChild('userList') userList!: UserListComponent;
  @ViewChild('vehicleList') vehicleList!: VehicleListComponent;

  readonly activeTab = signal<'vehicles' | 'users'>('vehicles');
  readonly leftDrawerOpened = signal(true);
  readonly isMobile = signal(false);

  // Vehicle filters state
  readonly searchQuery = signal('');
  readonly selectedType = signal('');
  readonly selectedStatus = signal('');
  readonly selectedReFuel = signal('');

  readonly activeFiltersCount = computed(() => {
    let count = 0;
    if (this.searchQuery().trim()) count++;
    if (this.selectedType()) count++;
    if (this.selectedStatus()) count++;
    if (this.selectedReFuel()) count++;
    return count;
  });

  readonly currentUserRole = computed(() => {
    return this.authService.currentUser()?.role || 'User';
  });

  readonly isAdmin = computed(() => {
    const role = this.currentUserRole();
    return role === 'Admin' || role === 'Super_Admin';
  });

  readonly isSuperAdmin = computed(() => {
    return this.currentUserRole() === 'Super_Admin';
  });

  readonly pageTitle = computed(() => {
    return this.isAdmin() ? 'Manage' : 'Directory';
  });

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize', [])
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    const isMobileSize = window.innerWidth < 1024;
    this.isMobile.set(isMobileSize);
    
    // Automatically close drawer on mobile, open on desktop
    this.leftDrawerOpened.set(!isMobileSize);
  }

  setActiveTab(tab: 'vehicles' | 'users'): void {
    this.activeTab.set(tab);
    if (this.isMobile()) {
      this.leftDrawerOpened.set(false);
    }
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedType.set('');
    this.selectedStatus.set('');
    this.selectedReFuel.set('');
  }

  openAddVehicleModal(): void {
    if (this.vehicleList) {
      this.vehicleList.openAddModal();
    }
  }

  openAddUserModal(): void {
    if (this.userList) {
      this.userList.openAddModal();
    }
  }
}
