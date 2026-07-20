import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AllSharedUi } from "../../../../shared/shared";
import { VEHICLE_TYPES } from "../../../../core/models/vehicle.model";

@Component({
  selector: "app-directory-filter-sidebar",
  standalone: true,
  imports: [CommonModule, FormsModule, ...AllSharedUi],
  templateUrl: "./directory-filter-sidebar.html",
})
export class DirectoryFilterSidebarComponent {
  @Input() showHeader = false;
  @Input() titleKey = "Search & Filters / ค้นหาและกรอง";

  @Input() searchQuery = "";
  @Input() selectedTypes: string[] = [];
  @Input() selectedStatus = "";
  @Input() selectedReFuel = "";

  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() selectedTypesChange = new EventEmitter<string[]>();
  @Output() selectedStatusChange = new EventEmitter<string>();
  @Output() selectedReFuelChange = new EventEmitter<string>();

  @Output() close = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();

  readonly vehicleTypes = VEHICLE_TYPES;

  toggleVehicleType(typeVal: string): void {
    const current = this.selectedTypes || [];
    if (current.includes(typeVal)) {
      this.selectedTypesChange.emit(current.filter((t) => t !== typeVal));
    } else {
      this.selectedTypesChange.emit([...current, typeVal]);
    }
  }
}
