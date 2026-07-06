import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Vehicle, VEHICLE_TYPES } from '../../../../core/models/vehicle.model';
import { User } from '../../../../core/models/user.model';
import { AllSharedUi } from '../../../../shared/shared';
@Component({
  selector: 'app-left-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, ...AllSharedUi],
  templateUrl: './left-sidebar.html',
})
export class LeftSidebar {
  @Input() searchQuery = '';
  @Input() selectedUserId = '';
  @Input() startDate = '';
  @Input() endDate = '';
  @Input() selectedStatusFilter = '';
  @Input() vehicles: Vehicle[] = [];
  @Input() users: User[] = [];
  @Input() selectedVehicleTypeFilter = '';
  @Input() showStatusFilter = false;

  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() selectedUserIdChange = new EventEmitter<string>();
  @Output() startDateChange = new EventEmitter<string>();
  @Output() endDateChange = new EventEmitter<string>();
  @Output() selectedStatusFilterChange = new EventEmitter<string>();
  @Output() toggleVehicleType = new EventEmitter<string>();
  @Output() resetFilters = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  readonly vehicleTypes = VEHICLE_TYPES;
}
