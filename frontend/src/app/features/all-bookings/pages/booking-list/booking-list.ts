import { Component, inject, signal, computed, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../../core/services/booking.service';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { UserService } from '../../../../core/services/user.service';
import { Booking } from '../../../../core/models/booking.model';
import { Vehicle, VEHICLE_TYPES } from '../../../../core/models/vehicle.model';
import { User } from '../../../../core/models/user.model';
import { AllSharedUi } from '../../../../shared/shared';
import { BookingDialogService } from '../../add-booking/booking-dialog.service';
import { BookingDetailModal } from '../../components/booking-detail-modal/booking-detail-modal';
import { BookingViews } from '../../components/booking-views/booking-views';
import { AuthService } from '../../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { FilterSidebar } from '../../components/booking-sidebar/filter-sidebar/filter-sidebar';
import { MobileFilters } from '../../components/booking-sidebar/mobile-filters/mobile-filters';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DailyBookingsSidebar } from '../../components/booking-sidebar/daily-bookings-sidebar/daily-bookings-sidebar';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ...AllSharedUi, BookingDetailModal, BookingViews, FilterSidebar, MobileFilters, MatSidenavModule, DailyBookingsSidebar],
  templateUrl: './booking-list.html',
})
export class BookingList implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly vehicleService = inject(VehicleService);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly bookingDialogService = inject(BookingDialogService);

  openBooking(): void {
    this.bookingDialogService.open();
  }

  readonly selectedBooking = signal<Booking | null>(null);
  readonly isModalOpen = signal(false);
  
  // Responsive
  readonly isMobile = signal(window.innerWidth < 1024);
  readonly leftDrawerOpened = signal(!this.isMobile());

  @HostListener('window:resize')
  onResize(): void {
    const mobile = window.innerWidth < 1024;
    this.isMobile.set(mobile);
    if (mobile && this.viewMode() === 'list') {
      this.viewMode.set('grid');
    }
  }

  // View Mode: calendar, grid, or list
  readonly viewMode = signal<'calendar' | 'grid' | 'list'>('calendar');

  // Dashboard Tab state
  readonly activeTab = signal<'active' | 'history'>('active');

  // Filters State
  readonly searchQuery = signal('');
  readonly selectedUserId = signal('');
  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly selectedStatusFilter = signal('');
  readonly showFilters = signal(false);
  readonly selectedVehicleTypeFilter = signal<string[]>([]);
  readonly selectedVehiclePlates = signal<string[]>([]);
  readonly selectedDate = signal<Date | string>('');
  readonly rightDrawerOpened = signal(false);
  readonly selectedDailyDate = signal<Date | null>(null);

  readonly filteredVehiclesForPills = computed(() => {
    const selectedTypes = this.selectedVehicleTypeFilter();
    if (selectedTypes.length === 0) return [];
    
    const list = this.vehiclesList();
    return list.filter(v => {
      const type = v.vehicleTypeId || 'Sedan';
      if (selectedTypes.includes('Sedan')) {
        if (type === 'Sedan' || (!type || type !== 'Pickup' && type !== 'Van' && type !== 'SUV' && type !== 'Other')) {
          return true;
        }
      }
      return selectedTypes.includes(type);
    });
  });

  readonly dailyBookings = computed(() => {
    const date = this.selectedDailyDate();
    if (!date) return [];
    const targetMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    
    return this.filteredBookings().filter(b => {
      if (!b.depart || !b.return) return false;
      const depDate = new Date(b.depart.replace(' ', 'T'));
      const retDate = new Date(b.return.replace(' ', 'T'));
      const depMidnight = new Date(depDate.getFullYear(), depDate.getMonth(), depDate.getDate()).getTime();
      const retMidnight = new Date(retDate.getFullYear(), retDate.getMonth(), retDate.getDate()).getTime();
      return targetMidnight >= depMidnight && targetMidnight <= retMidnight;
    }).sort((a, b) => new Date(a.depart.replace(' ', 'T')).getTime() - new Date(b.depart.replace(' ', 'T')).getTime());
  });

  readonly vehicleTypes = VEHICLE_TYPES;

  // Dropdown Lists
  readonly vehiclesList = signal<Vehicle[]>([]);
  readonly usersList = signal<User[]>([]);

  get isAdmin(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'Admin' || role === 'Super_Admin';
  }

  ngOnInit(): void {
    this.vehicleService.findAll().subscribe(res => this.vehiclesList.set(res));
    this.userService.findAll().subscribe(res => {
      this.usersList.set(res.filter(u => u.role === 'User'));
    });
    
    this.loadBookings();
  }

  setActiveTab(tab: 'active' | 'history'): void {
    this.activeTab.set(tab);
    this.selectedStatusFilter.set('');
    this.loadBookings();
  }

  toggleVehicleType(type: string): void {
    const current = this.selectedVehicleTypeFilter();
    if (current.includes(type)) {
      this.selectedVehicleTypeFilter.set(current.filter(t => t !== type));
    } else {
      this.selectedVehicleTypeFilter.set([...current, type]);
    }
    
    // Auto-update selected vehicle IDs to match the updated type selection
    const availableIds = this.filteredVehiclesForPills().map(v => v.id);
    this.selectedVehiclePlates.set(this.selectedVehiclePlates().filter(id => availableIds.includes(id)));
  }

  toggleVehiclePlate(vehicleId: string): void {
    const current = this.selectedVehiclePlates();
    if (current.includes(vehicleId)) {
      this.selectedVehiclePlates.set(current.filter(id => id !== vehicleId));
    } else {
      this.selectedVehiclePlates.set([...current, vehicleId]);
    }
  }

  onDateSelected(date: Date): void {
    this.selectedDate.set(date);
  }

  onMoreClicked(date: Date): void {
    this.selectedDailyDate.set(date);
    this.rightDrawerOpened.set(true);
  }

  /** Check if a booking is past its return time (auto-complete) */
  private isAutoComplete(booking: Booking): boolean {
    if (booking.status !== 'CONFIRMED') return false;
    const returnTime = new Date((booking.return || '').replace(' ', 'T'));
    return !isNaN(returnTime.getTime()) && returnTime < new Date();
  }

  loadBookings(): void {
    const filters: any = {};

    if (this.activeTab() === 'active') {
      filters.status = 'booked';
    } else if (this.selectedStatusFilter()) {
      filters.status = this.selectedStatusFilter() === 'CONFIRMED' ? 'booked' : 
                       (this.selectedStatusFilter() === 'COMPLETED' ? 'complete' : 'cancel');
    }

    if (this.selectedUserId()) {
      filters.user_id = Number(this.selectedUserId());
    }
    if (this.startDate()) {
      filters.depart_start = this.startDate().replace('T', ' ') + ':00';
    }
    if (this.endDate()) {
      filters.depart_end = this.endDate().replace('T', ' ') + ':00';
    }

    this.bookingService.fetchBookings(filters).subscribe({
      error: (err) => console.error('Error fetching bookings:', err)
    });
  }

  onFilterChange(): void {
    this.loadBookings();
  }

  // Filter bookings locally by search query and vehicle type
  readonly filteredBookings = computed(() => {
    const list = this.bookingService.bookings();
    const query = this.searchQuery().toLowerCase().trim();
    const now = new Date();

    let result = list;

    // Filter by activeTab:
    if (this.activeTab() === 'active') {
      result = result.filter(b => {
        if (b.status === 'CANCELLED' || b.status === 'COMPLETED') return false;
        // Auto-complete: hide CONFIRMED bookings past return time
        const returnTime = new Date((b.return || '').replace(' ', 'T'));
        if (!isNaN(returnTime.getTime()) && returnTime < now) return false;
        return true;
      });
    }

    // Filter by Search Query
    if (query) {
      result = result.filter(b => {
        const dest = (b.destination || '').toLowerCase();
        const purp = (b.purpose || '').toLowerCase();
        const user = (b.userName || '').toLowerCase();
        const vehicleModel = b.vehicle ? (b.vehicle.model || '').toLowerCase() : '';
        const vehiclePlate = b.vehicle ? (b.vehicle.plateNumber || '').toLowerCase() : '';

        return dest.includes(query) || 
               purp.includes(query) || 
               user.includes(query) || 
               vehicleModel.includes(query) || 
               vehiclePlate.includes(query);
      });
    }

    // Filter by Quick Vehicle Type Filter
    if (this.selectedVehicleTypeFilter().length > 0) {
      const selectedTypes = this.selectedVehicleTypeFilter();
      result = result.filter(b => {
        const type = b.vehicle?.vehicleTypeId || 'Sedan';
        if (selectedTypes.includes('Sedan')) {
          if (type === 'Sedan' || (!type || type !== 'Pickup' && type !== 'Van' && type !== 'SUV' && type !== 'Other')) {
            return true;
          }
        }
        return selectedTypes.includes(type);
      });
    }

    // Filter by Selected Vehicle License Plates (using unique vehicle IDs)
    if (this.selectedVehiclePlates().length > 0) {
      const selectedIds = this.selectedVehiclePlates();
      result = result.filter(b => {
        const vehicleId = b.vehicle?.id;
        return vehicleId ? selectedIds.includes(vehicleId) : false;
      });
    }

    // Sort by Booking ID descending
    return [...result].sort((a, b) => Number(b.id) - Number(a.id));
  });

  resetFilters(): void {
    this.selectedUserId.set('');
    this.startDate.set('');
    this.endDate.set('');
    this.searchQuery.set('');
    this.selectedStatusFilter.set('');
    this.selectedVehicleTypeFilter.set([]);
    this.selectedVehiclePlates.set([]);
    this.loadBookings();
  }

  openDetail(booking: Booking): void {
    this.selectedBooking.set(booking);
    this.isModalOpen.set(true);
  }

  closeDetail(): void {
    this.isModalOpen.set(false);
    this.selectedBooking.set(null);
  }

  onCancelBooking(id: string): void {
    const isConfirmed = confirm('Are you sure you want to cancel this booking?');
    if (isConfirmed) {
      this.bookingService.cancelBooking(id).subscribe({
        next: () => {
          this.closeDetail();
          this.loadBookings();
        },
        error: (err: any) => {
          alert(err.error?.message || 'An error occurred while cancelling the booking. Please try again.');
        }
      });
    }
  }

  onCompleteBooking(id: string, mileDistance: number): void {
    this.bookingService.completeBooking(id, mileDistance).subscribe({
      next: () => {
        this.closeDetail();
        this.loadBookings();
      },
      error: (err: any) => {
        alert(err.error?.message || 'An error occurred while completing the booking. Please try again.');
      }
    });
  }

}
