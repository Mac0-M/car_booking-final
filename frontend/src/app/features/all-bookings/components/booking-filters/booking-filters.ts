import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Vehicle } from '../../../../core/models/vehicle.model';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-booking-filters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-filters.html',
})
export class BookingFilters {
  @Input() vehicles: Vehicle[] = [];
  @Input() users: User[] = [];
  @Input() viewModes: string[] = [];
  @Input() currentViewMode = '';

  // Input states
  @Input() searchQuery = '';
  @Input() selectedVehicleId = '';
  @Input() selectedUserId = '';
  @Input() startDate = '';
  @Input() endDate = '';
  @Input() selectedStatusFilter = '';

  @Input() showStatusFilter = false;
  @Input() placeholder = 'ค้นหา...';

  // Outputs to sync state back to parent
  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() selectedVehicleIdChange = new EventEmitter<string>();
  @Output() selectedUserIdChange = new EventEmitter<string>();
  @Output() startDateChange = new EventEmitter<string>();
  @Output() endDateChange = new EventEmitter<string>();
  @Output() selectedStatusFilterChange = new EventEmitter<string>();
  @Output() viewModeChange = new EventEmitter<any>();
  @Output() reset = new EventEmitter<void>();

  // Internal component UI state
  readonly showAdvancedFilters = signal(false);

  getModeIcon(mode: string): string {
    switch (mode) {
      case 'calendar': return 'calendar_today';
      case 'block': return 'grid_view';
      case 'list': return 'format_list_bulleted';
      default: return 'help_outline';
    }
  }

  getModeLabel(mode: string): string {
    switch (mode) {
      case 'calendar': return 'ปฏิทิน (Calendar)';
      case 'block': return 'บล็อก (Blocks)';
      case 'list': return 'ตาราง (List)';
      default: return mode;
    }
  }
}
