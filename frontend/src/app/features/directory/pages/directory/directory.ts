import { Component, OnInit, inject, signal, computed, ViewChild, HostListener, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AllSharedUi } from '../../../../shared/shared';
import { AuthService } from '../../../../core/services/auth.service';
import { HeaderService } from '../../../../core/services/header.service';
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
export class DirectoryComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  readonly router = inject(Router);
  private readonly headerService = inject(HeaderService);

  @ViewChild('userList') userList!: UserListComponent;
  @ViewChild('vehicleList') vehicleList!: VehicleListComponent;
  @ViewChild(DirectoryLeftSidebarComponent) leftSidebar?: DirectoryLeftSidebarComponent;

  readonly activeTab = signal<'vehicles' | 'users'>('vehicles');
  readonly leftDrawerOpened = signal(true);
  readonly isMobile = signal(false);

  // Vehicle filters state
  readonly searchQuery = signal('');
  readonly selectedType = signal('');
  readonly selectedStatus = signal('');
  readonly selectedReFuel = signal('');

  constructor() {
    // Load cached filters FIRST
    const cached = localStorage.getItem('directory_filters');
    if (cached) {
      try {
        const filters = JSON.parse(cached);
        if (filters.searchQuery !== undefined) this.searchQuery.set(filters.searchQuery);
        if (filters.selectedType !== undefined) this.selectedType.set(filters.selectedType);
        if (filters.selectedStatus !== undefined) this.selectedStatus.set(filters.selectedStatus);
        if (filters.selectedReFuel !== undefined) this.selectedReFuel.set(filters.selectedReFuel);
        if (filters.activeTab !== undefined) this.activeTab.set(filters.activeTab);
      } catch (e) {
        console.error('Error parsing cached directory filters:', e);
      }
    }

    // Register the effect
    effect(() => {
      const filters = {
        searchQuery: this.searchQuery(),
        selectedType: this.selectedType(),
        selectedStatus: this.selectedStatus(),
        selectedReFuel: this.selectedReFuel(),
        activeTab: this.activeTab()
      };
      localStorage.setItem('directory_filters', JSON.stringify(filters));
    });

    // Sync with HeaderService for mobile filter button
    effect(() => {
      const mobile = this.isMobile();
      const tab = this.activeTab();
      const count = this.activeFiltersCount();

      if (mobile && tab === 'vehicles') {
        this.headerService.isMobileFilterVisible.set(true);
        this.headerService.mobileFilterAction.set(() => {
          if (this.leftSidebar?.mobileFilters) {
            this.leftSidebar.mobileFilters.openMobileFilters();
          }
        });
        this.headerService.clearFilterAction.set(() => {
          this.resetFilters();
        });
        this.headerService.activeFiltersCount.set(count);
      } else {
        this.headerService.reset();
      }
    }, { allowSignalWrites: true });
  }

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
    return this.isAdmin() ? 'Management' : 'Directory';
  });

  ngOnInit(): void {
    this.checkScreenSize();
    if (!this.isAdmin()) {
      this.activeTab.set('vehicles');
    }
  }

  ngOnDestroy(): void {
    this.headerService.reset();
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
    if (tab === this.activeTab()) {
      const nextTab = this.activeTab() === 'vehicles' ? 'users' : 'vehicles';
      this.activeTab.set(nextTab);
    } else {
      this.activeTab.set(tab);
    }
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
