import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AllSharedUi } from "../../../../shared/shared";
import { VEHICLE_TYPES } from "../../../../core/models/vehicle.model";
import { ComponentMobileFilters } from "../../../../shared/components/mobile-filters/mobile-filters";

@Component({
  selector: "app-directory-mobile-filters",
  standalone: true,
  imports: [CommonModule, FormsModule, ...AllSharedUi],
  templateUrl: "./directory-mobile-filters.html",
})
export class DirectoryMobileFiltersComponent implements OnDestroy {
  @ViewChild(ComponentMobileFilters) sharedFilters?: ComponentMobileFilters;

  @Input() searchQuery = "";
  @Input() selectedTypes: string[] = [];
  @Input() selectedStatus = "";
  @Input() selectedReFuel = "";
  @Input() activeFiltersCount = 0;
  @Input() showTrigger = true;

  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() selectedTypesChange = new EventEmitter<string[]>();
  @Output() selectedStatusChange = new EventEmitter<string>();
  @Output() selectedReFuelChange = new EventEmitter<string>();
  @Output() resetFilters = new EventEmitter<void>();

  readonly vehicleTypes = VEHICLE_TYPES;

  // Local drafts for buffering changes before Apply is clicked
  localSearchQuery = "";
  localSelectedTypes: string[] = [];
  localSelectedStatus = "";
  localSelectedReFuel = "";

  toggleLocalVehicleType(typeVal: string): void {
    const current = this.localSelectedTypes || [];
    if (current.includes(typeVal)) {
      this.localSelectedTypes = current.filter((t) => t !== typeVal);
    } else {
      this.localSelectedTypes = [...current, typeVal];
    }
  }

  openMobileFilters(): void {
    if (this.sharedFilters) {
      this.sharedFilters.openMobileFilters();
    }
  }

  onOpenFilters(): void {
    this.localSearchQuery = this.searchQuery;
    this.localSelectedTypes = [...(this.selectedTypes || [])];
    this.localSelectedStatus = this.selectedStatus;
    this.localSelectedReFuel = this.selectedReFuel;
  }

  closeMobileFilters(): void {
    if (this.sharedFilters) {
      this.sharedFilters.closeMobileFilters();
    }
  }

  applyFilters(): void {
    this.searchQueryChange.emit(this.localSearchQuery);
    this.selectedTypesChange.emit(this.localSelectedTypes);
    this.selectedStatusChange.emit(this.localSelectedStatus);
    this.selectedReFuelChange.emit(this.localSelectedReFuel);
  }

  clearAllFilters(): void {
    this.localSearchQuery = "";
    this.localSelectedTypes = [];
    this.localSelectedStatus = "";
    this.localSelectedReFuel = "";
    this.resetFilters.emit();
    this.closeMobileFilters();
  }

  ngOnDestroy(): void {
    this.closeMobileFilters();
  }
}
