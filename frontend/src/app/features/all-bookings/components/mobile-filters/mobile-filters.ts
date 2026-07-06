import { Component, Input, Output, EventEmitter, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Vehicle, VEHICLE_TYPES } from "../../../../core/models/vehicle.model";
import { User } from "../../../../core/models/user.model";
import { AllSharedUi } from "../../../../shared/shared";
import { BookingFilters } from "../booking-filters/booking-filters";

@Component({
  selector: "app-mobile-filters",
  standalone: true,
  imports: [CommonModule, FormsModule, ...AllSharedUi, BookingFilters],
  templateUrl: "./mobile-filters.html",
})
export class MobileFilters {
  @Input() isMobileHeader = false;
  @Input() vehicles: Vehicle[] = [];
  @Input() users: User[] = [];
  @Input() activeTab: "active" | "history" = "active";

  // State bindings
  @Input() searchQuery = "";
  @Input() selectedUserId = "";
  @Input() startDate = "";
  @Input() endDate = "";
  @Input() selectedStatusFilter = "";
  @Input() selectedVehicleTypeFilter = "";
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

  // Local drafts for buffering changes before Apply is clicked
  localSearchQuery = '';
  localSelectedUserId = '';
  localStartDate = '';
  localEndDate = '';
  localSelectedStatusFilter = '';
  localSelectedVehicleTypeFilter = '';

  toggleLocalVehicleType(type: string): void {
    if (this.localSelectedVehicleTypeFilter === type) {
      this.localSelectedVehicleTypeFilter = '';
    } else {
      this.localSelectedVehicleTypeFilter = type;
    }
  }

  openMobileFilters(): void {
    this.localSearchQuery = this.searchQuery;
    this.localSelectedUserId = this.selectedUserId;
    this.localStartDate = this.startDate;
    this.localEndDate = this.endDate;
    this.localSelectedStatusFilter = this.selectedStatusFilter;
    this.localSelectedVehicleTypeFilter = this.selectedVehicleTypeFilter;
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

  applyFilters(): void {
    this.searchQueryChange.emit(this.localSearchQuery);
    this.selectedUserIdChange.emit(this.localSelectedUserId);
    this.startDateChange.emit(this.localStartDate);
    this.endDateChange.emit(this.localEndDate);
    this.selectedStatusFilterChange.emit(this.localSelectedStatusFilter);
    this.toggleVehicleType.emit(this.localSelectedVehicleTypeFilter);
    this.filterChange.emit();
    this.closeMobileFilters();
  }

  clearAllFilters(): void {
    this.localSearchQuery = '';
    this.localSelectedUserId = '';
    this.localStartDate = '';
    this.localEndDate = '';
    this.localSelectedStatusFilter = '';
    this.localSelectedVehicleTypeFilter = '';
    
    this.resetFilters.emit();
    this.closeMobileFilters();
  }
}
