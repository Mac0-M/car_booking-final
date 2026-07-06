import { Component, Input, Output, EventEmitter, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AllSharedUi } from "../../../../shared/shared";
import { VEHICLE_TYPES } from "../../../../core/models/vehicle.model";

@Component({
  selector: "app-directory-mobile-filters",
  standalone: true,
  imports: [CommonModule, FormsModule, ...AllSharedUi],
  templateUrl: "./directory-mobile-filters.html",
})
export class DirectoryMobileFiltersComponent {
  @Input() searchQuery = "";
  @Input() selectedType = "";
  @Input() selectedStatus = "";
  @Input() selectedReFuel = "";
  @Input() activeFiltersCount = 0;

  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() selectedTypeChange = new EventEmitter<string>();
  @Output() selectedStatusChange = new EventEmitter<string>();
  @Output() selectedReFuelChange = new EventEmitter<string>();
  @Output() resetFilters = new EventEmitter<void>();

  readonly vehicleTypes = VEHICLE_TYPES;
  readonly showMobileFiltersPopup = signal(false);

  // Local drafts for buffering changes before Apply is clicked
  localSearchQuery = '';
  localSelectedType = '';
  localSelectedStatus = '';
  localSelectedReFuel = '';

  toggleLocalVehicleType(typeVal: string): void {
    if (this.localSelectedType === typeVal) {
      this.localSelectedType = '';
    } else {
      this.localSelectedType = typeVal;
    }
  }

  openMobileFilters(): void {
    this.localSearchQuery = this.searchQuery;
    this.localSelectedType = this.selectedType;
    this.localSelectedStatus = this.selectedStatus;
    this.localSelectedReFuel = this.selectedReFuel;
    this.showMobileFiltersPopup.set(true);
  }

  closeMobileFilters(): void {
    this.showMobileFiltersPopup.set(false);
  }

  applyFilters(): void {
    this.searchQueryChange.emit(this.localSearchQuery);
    this.selectedTypeChange.emit(this.localSelectedType);
    this.selectedStatusChange.emit(this.localSelectedStatus);
    this.selectedReFuelChange.emit(this.localSelectedReFuel);
    this.closeMobileFilters();
  }

  clearAllFilters(): void {
    this.localSearchQuery = '';
    this.localSelectedType = '';
    this.localSelectedStatus = '';
    this.localSelectedReFuel = '';
    this.resetFilters.emit();
    this.closeMobileFilters();
  }
}
