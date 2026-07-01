import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AllSharedUi } from '../../../../shared/shared';
import { VEHICLE_TYPES } from '../../../../core/models/vehicle.model';

@Component({
  selector: 'app-directory-mobile-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, ...AllSharedUi],
  templateUrl: './directory-mobile-filters.html',
})
export class DirectoryMobileFiltersComponent {
  @Input() searchQuery = '';
  @Input() selectedType = '';
  @Input() selectedStatus = '';
  @Input() selectedReFuel = '';
  @Input() activeFiltersCount = 0;

  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() selectedTypeChange = new EventEmitter<string>();
  @Output() selectedStatusChange = new EventEmitter<string>();
  @Output() selectedReFuelChange = new EventEmitter<string>();
  @Output() resetFilters = new EventEmitter<void>();

  readonly vehicleTypes = VEHICLE_TYPES;
  readonly showMobileFiltersPopup = signal(false);

  toggleVehicleType(typeVal: string): void {
    if (this.selectedType === typeVal) {
      this.selectedTypeChange.emit('');
    } else {
      this.selectedTypeChange.emit(typeVal);
    }
  }

  openMobileFilters(): void {
    this.showMobileFiltersPopup.set(true);
  }

  closeMobileFilters(): void {
    this.showMobileFiltersPopup.set(false);
  }
}
