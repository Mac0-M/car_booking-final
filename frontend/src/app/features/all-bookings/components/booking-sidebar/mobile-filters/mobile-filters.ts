import { Component, Input, Output, EventEmitter, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Vehicle, VEHICLE_TYPES } from "../../../../../core/models/vehicle.model";
import { User } from "../../../../../core/models/user.model";
import { AllSharedUi } from "../../../../../shared/shared";
import { FilterSidebar } from "../filter-sidebar/filter-sidebar";

@Component({
  selector: "app-mobile-filters",
  standalone: true,
  imports: [CommonModule, FormsModule, ...AllSharedUi, FilterSidebar],
  templateUrl: "./mobile-filters.html",
})
export class MobileFilters {
  getVehicleColor(vehicle: Vehicle): { dotColor: string; ringClass: string } {
    const type = vehicle.vehicleTypeId || 'Sedan';
    const found = VEHICLE_TYPES.find(t => t.value === type);
    return found ? { dotColor: found.dotColor, ringClass: found.ringClass } : { dotColor: 'bg-gray-400', ringClass: 'ring-gray-400' };
  }
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
  @Input() selectedVehicleTypeFilter: string[] = [];
  @Input() selectedVehiclePlates: string[] = [];
  @Input() showLegend = true;

  readonly vehicleTypes = VEHICLE_TYPES;

  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() selectedUserIdChange = new EventEmitter<string>();
  @Output() startDateChange = new EventEmitter<string>();
  @Output() endDateChange = new EventEmitter<string>();
  @Output() selectedStatusFilterChange = new EventEmitter<string>();
  @Output() selectedVehicleTypeFilterChange = new EventEmitter<string[]>();
  @Output() selectedVehiclePlatesChange = new EventEmitter<string[]>();
  @Output() resetFilters = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<void>();

  // Internal popup visibility state
  readonly showMobileFiltersPopup = signal(false);

  // Local drafts for buffering changes before Apply is clicked
  localSearchQuery = '';
  localSelectedUserId = '';
  localStartDate = '';
  localEndDate = '';
  localSelectedStatusFilter = '';
  localSelectedVehicleTypeFilter: string[] = [];
  localSelectedVehiclePlates: string[] = [];

  get localFilteredVehiclesForPills(): Vehicle[] {
    const selectedTypes = this.localSelectedVehicleTypeFilter;
    if (selectedTypes.length === 0) return [];
    
    return this.vehicles.filter(v => {
      const type = v.vehicleTypeId || 'Sedan';
      if (selectedTypes.includes('Sedan')) {
        if (type === 'Sedan' || (!type || type !== 'Pickup' && type !== 'Van' && type !== 'SUV' && type !== 'Other')) {
          return true;
        }
      }
      return selectedTypes.includes(type);
    });
  }

  toggleLocalVehicleType(type: string): void {
    if (this.localSelectedVehicleTypeFilter.includes(type)) {
      this.localSelectedVehicleTypeFilter = this.localSelectedVehicleTypeFilter.filter(t => t !== type);
    } else {
      this.localSelectedVehicleTypeFilter = [...this.localSelectedVehicleTypeFilter, type];
    }
    // Auto-update selected license plates to match the updated type selection
    const availableIds = this.localFilteredVehiclesForPills.map(v => v.id);
    this.localSelectedVehiclePlates = this.localSelectedVehiclePlates.filter(id => availableIds.includes(id));
  }

  toggleLocalVehiclePlate(vehicleId: string): void {
    if (this.localSelectedVehiclePlates.includes(vehicleId)) {
      this.localSelectedVehiclePlates = this.localSelectedVehiclePlates.filter(id => id !== vehicleId);
    } else {
      this.localSelectedVehiclePlates = [...this.localSelectedVehiclePlates, vehicleId];
    }
  }

  openMobileFilters(): void {
    this.localSearchQuery = this.searchQuery;
    this.localSelectedUserId = this.selectedUserId;
    this.localStartDate = this.startDate;
    this.localEndDate = this.endDate;
    this.localSelectedStatusFilter = this.selectedStatusFilter;
    this.localSelectedVehicleTypeFilter = [...this.selectedVehicleTypeFilter];
    this.localSelectedVehiclePlates = [...this.selectedVehiclePlates];
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
    if (this.selectedVehicleTypeFilter.length > 0) count++;
    if (this.selectedVehiclePlates.length > 0) count++;
    return count;
  }

  applyFilters(): void {
    this.searchQueryChange.emit(this.localSearchQuery);
    this.selectedUserIdChange.emit(this.localSelectedUserId);
    this.startDateChange.emit(this.localStartDate);
    this.endDateChange.emit(this.localEndDate);
    this.selectedStatusFilterChange.emit(this.localSelectedStatusFilter);
    this.selectedVehicleTypeFilterChange.emit(this.localSelectedVehicleTypeFilter);
    this.selectedVehiclePlatesChange.emit(this.localSelectedVehiclePlates);
    this.filterChange.emit();
    this.closeMobileFilters();
  }

  clearAllFilters(): void {
    this.localSearchQuery = '';
    this.localSelectedUserId = '';
    this.localStartDate = '';
    this.localEndDate = '';
    this.localSelectedStatusFilter = '';
    this.localSelectedVehicleTypeFilter = [];
    this.localSelectedVehiclePlates = [];
    
    this.resetFilters.emit();
    this.closeMobileFilters();
  }
}
