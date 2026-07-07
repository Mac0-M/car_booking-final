import { Component, Input, Output, EventEmitter, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Vehicle, VEHICLE_TYPES } from "../../../../../core/models/vehicle.model";
import { User } from "../../../../../core/models/user.model";
import { AllSharedUi } from "../../../../../shared/shared";

@Component({
  selector: "app-filter-sidebar",
  standalone: true,
  imports: [CommonModule, FormsModule, ...AllSharedUi],
  templateUrl: "./filter-sidebar.html",
  host: {
    class: "h-full flex flex-col",
  },
})
export class FilterSidebar {
  getVehicleColor(vehicle: Vehicle): { dotColor: string; ringClass: string } {
    const type = vehicle.vehicleTypeId || 'Sedan';
    const found = VEHICLE_TYPES.find(t => t.value === type);
    return found ? { dotColor: found.dotColor, ringClass: found.ringClass } : { dotColor: 'bg-gray-400', ringClass: 'ring-gray-400' };
  }
  @Input() vehicles: Vehicle[] = [];
  @Input() users: User[] = [];
  @Input() viewModes: string[] = [];
  @Input() currentViewMode = "";

  // Input states
  @Input() searchQuery = "";
  @Input() selectedUserId = "";
  @Input() startDate = "";
  @Input() endDate = "";
  @Input() selectedStatusFilter = "";
  @Input() selectedVehicleTypeFilter: string[] = [];
  @Input() selectedVehiclePlates: string[] = [];
  @Input() filteredVehiclesForPills: Vehicle[] = [];

  @Input() showStatusFilter = false;
  @Input() placeholder = "Search...";
  @Input() forceExpanded = false;
  @Input() showHeader = false;
  @Input() showQuickFilters = false;

  // Outputs
  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() selectedUserIdChange = new EventEmitter<string>();
  @Output() startDateChange = new EventEmitter<string>();
  @Output() endDateChange = new EventEmitter<string>();
  @Output() selectedStatusFilterChange = new EventEmitter<string>();
  @Output() viewModeChange = new EventEmitter<any>();
  @Output() toggleVehicleType = new EventEmitter<string>();
  @Output() toggleVehiclePlate = new EventEmitter<string>();
  @Output() reset = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  // Internal state
  readonly showAdvancedFilters = signal(false);
  readonly vehicleTypes = VEHICLE_TYPES;

  getModeIcon(mode: string): string {
    switch (mode) {
      case "calendar":
        return "calendar_today";
      case "grid":
        return "grid_view";
      case "list":
        return "format_list_bulleted";
      default:
        return "help_outline";
    }
  }

  getModeLabel(mode: string): string {
    switch (mode) {
      case "calendar":
        return "Calendar";
      case "grid":
        return "Grid";
      case "list":
        return "List";
      default:
        return mode;
    }
  }
}
