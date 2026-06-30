import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Vehicle } from '../../../../core/models/vehicle.model';
import { User } from '../../../../core/models/user.model';
import { AllSharedUi } from '../../../../shared/shared';

@Component({
  selector: 'app-left-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, ...AllSharedUi],
  templateUrl: './left-sidebar.html',
})
export class LeftSidebar {
  @Input() activeTab: 'active' | 'history' = 'active';
  @Input() viewMode: 'calendar' | 'grid' | 'list' = 'calendar';
  @Input() searchQuery = '';
  @Input() selectedVehicleId = '';
  @Input() selectedUserId = '';
  @Input() startDate = '';
  @Input() endDate = '';
  @Input() selectedStatusFilter = '';
  @Input() showFilters = false;
  @Input() vehicles: Vehicle[] = [];
  @Input() users: User[] = [];
  @Input() isMobile = false;

  @Output() activeTabChange = new EventEmitter<'active' | 'history'>();
  @Output() viewModeChange = new EventEmitter<'calendar' | 'grid' | 'list'>();
  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() selectedVehicleIdChange = new EventEmitter<string>();
  @Output() selectedUserIdChange = new EventEmitter<string>();
  @Output() startDateChange = new EventEmitter<string>();
  @Output() endDateChange = new EventEmitter<string>();
  @Output() selectedStatusFilterChange = new EventEmitter<string>();
  @Output() showFiltersChange = new EventEmitter<boolean>();
  
  @Output() filterChange = new EventEmitter<void>();
  @Output() resetFilters = new EventEmitter<void>();
  @Output() addBooking = new EventEmitter<void>();
  @Output() closeDrawer = new EventEmitter<void>();

  onActiveTabSelect(tab: 'active' | 'history'): void {
    this.activeTabChange.emit(tab);
    if (this.isMobile) {
      this.closeDrawer.emit();
    }
  }

  onViewModeSelect(mode: 'calendar' | 'grid' | 'list'): void {
    this.viewModeChange.emit(mode);
    if (this.isMobile) {
      this.closeDrawer.emit();
    }
  }

  onSearchInput(value: string): void {
    this.searchQueryChange.emit(value);
    this.filterChange.emit();
  }

  onVehicleSelect(value: string): void {
    this.selectedVehicleIdChange.emit(value);
    this.filterChange.emit();
  }

  onUserSelect(value: string): void {
    this.selectedUserIdChange.emit(value);
    this.filterChange.emit();
  }

  onStartDateSelect(value: string): void {
    this.startDateChange.emit(value);
    this.filterChange.emit();
  }

  onEndDateSelect(value: string): void {
    this.endDateChange.emit(value);
    this.filterChange.emit();
  }

  onStatusSelect(value: string): void {
    this.selectedStatusFilterChange.emit(value);
    this.filterChange.emit();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    this.showFiltersChange.emit(this.showFilters);
  }
}
