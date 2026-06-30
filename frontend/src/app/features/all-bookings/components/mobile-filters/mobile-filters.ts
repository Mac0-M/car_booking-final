import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Vehicle, VEHICLE_TYPES } from '../../../../core/models/vehicle.model';
import { User } from '../../../../core/models/user.model';
import { AllSharedUi } from '../../../../shared/shared';
import { BookingFilters } from '../booking-filters/booking-filters';

@Component({
  selector: 'app-mobile-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, ...AllSharedUi, BookingFilters],
  templateUrl: './mobile-filters.html',
})
export class MobileFilters {
  @Input() isMobileHeader = false;
  @Input() vehicles: Vehicle[] = [];
  @Input() users: User[] = [];
  @Input() activeTab: 'active' | 'history' = 'active';
  
  // State bindings
  @Input() searchQuery = '';
  @Input() selectedUserId = '';
  @Input() startDate = '';
  @Input() endDate = '';
  @Input() selectedStatusFilter = '';
  @Input() selectedVehicleTypeFilter = '';
  @Input() showLegend = true;

  readonly vehicleTypes = VEHICLE_TYPES;

  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() selectedUserIdChange = new EventEmitter<string>();
  @Output() startDateChange = new EventEmitter<string>();
  @Output() endDateChange = new EventEmitter<string>();
  @Output() selectedStatusFilterChange = new EventEmitter<string>();
  @Output() resetFilters = new EventEmitter<void>();
  @Output() toggleVehicleType = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<void>();

  // Internal popup visibility state
  readonly showMobileFiltersPopup = signal(false);

  openMobileFilters(): void {
    this.showMobileFiltersPopup.set(true);
  }

  closeMobileFilters(): void {
    this.showMobileFiltersPopup.set(false);
  }

  get activeFiltersCount(): number {
    let count = 0;
    if (this.searchQuery && this.searchQuery.trim()) count++;
    if (this.selectedUserId) count++;
    if (this.startDate) count++;
    if (this.endDate) count++;
    if (this.selectedStatusFilter) count++;
    if (this.selectedVehicleTypeFilter) count++;
    return count;
  }

  onSearchInput(value: string): void {
    this.searchQueryChange.emit(value);
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
}
