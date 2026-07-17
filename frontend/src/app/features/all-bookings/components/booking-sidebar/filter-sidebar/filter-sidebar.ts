import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  Vehicle,
  VEHICLE_TYPES,
} from "../../../../../core/models/vehicle.model";
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
    const type = vehicle.vehicleTypeId || "Sedan";
    const found = VEHICLE_TYPES.find((t) => t.value === type);
    return found
      ? { dotColor: found.dotColor, ringClass: found.ringClass }
      : { dotColor: "bg-sand-400", ringClass: "ring-sand-400" };
  }
  @Input() vehicles: Vehicle[] = [];
  @Input() users: User[] = [];

  @Input() selectedDate: Date | string = "";
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
  @Input() showHeader = false;
  @Input() showQuickFilters = false;

  @Output() selectedDateChange = new EventEmitter<Date | string>();
  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() selectedUserIdChange = new EventEmitter<string>();
  @Output() startDateChange = new EventEmitter<string>();
  @Output() endDateChange = new EventEmitter<string>();
  @Output() selectedStatusFilterChange = new EventEmitter<string>();
  @Output() toggleVehicleType = new EventEmitter<string>();
  @Output() toggleVehiclePlate = new EventEmitter<string>();
  @Output() reset = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  readonly vehicleTypes = VEHICLE_TYPES;

  get currentMonthValue(): string {
    if (this.selectedDate) {
      const date =
        this.selectedDate instanceof Date
          ? this.selectedDate
          : new Date(this.selectedDate);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        return `${year}-${month}`;
      }
    }
    return "";
  }

  onMonthFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      const parts = input.value.split("-");
      if (parts.length >= 2) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const selectedDate = new Date(year, month, 1);
        this.selectedDateChange.emit(selectedDate);
      }
    } else {
      this.selectedDateChange.emit("");
    }
  }
}
