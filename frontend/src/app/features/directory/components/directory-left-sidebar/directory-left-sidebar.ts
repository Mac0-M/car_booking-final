import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AllSharedUi } from "../../../../shared/shared";
import { VEHICLE_TYPES } from "../../../../core/models/vehicle.model";
import { DirectoryMobileFiltersComponent } from "../directory-mobile-filters/directory-mobile-filters";

@Component({
  selector: "app-directory-left-sidebar",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DirectoryMobileFiltersComponent,
    ...AllSharedUi,
  ],
  templateUrl: "./directory-left-sidebar.html",
})
export class DirectoryLeftSidebarComponent {
  @ViewChild(DirectoryMobileFiltersComponent)
  mobileFilters?: DirectoryMobileFiltersComponent;
  @Input() activeTab: "vehicles" | "users" = "vehicles";
  @Input() isMobile = false;
  @Input() isAdmin = false;
  @Input() isSuperAdmin = false;
  @Input() isMobileHeader = false;

  // Filters inputs
  @Input() searchQuery = "";
  @Input() selectedType = "";
  @Input() selectedStatus = "";
  @Input() selectedReFuel = "";
  @Input() activeFiltersCount = 0;

  // Outputs
  @Output() activeTabChange = new EventEmitter<"vehicles" | "users">();
  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() selectedTypeChange = new EventEmitter<string>();
  @Output() selectedStatusChange = new EventEmitter<string>();
  @Output() selectedReFuelChange = new EventEmitter<string>();
  @Output() resetFilters = new EventEmitter<void>();
  @Output() addVehicle = new EventEmitter<void>();
  @Output() addUser = new EventEmitter<void>();

  readonly vehicleTypes = VEHICLE_TYPES;

  toggleVehicleType(typeVal: string): void {
    if (this.selectedType === typeVal) {
      this.selectedTypeChange.emit("");
    } else {
      this.selectedTypeChange.emit(typeVal);
    }
  }
}
