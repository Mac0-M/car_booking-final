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
import { LeftSidebar } from '../../components/left-sidebar/left-sidebar';
import { MobileFilters } from '../../components/mobile-filters/mobile-filters';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ...AllSharedUi, BookingDetailModal, BookingViews, LeftSidebar, MobileFilters, MatSidenavModule],
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
  readonly leftDrawerOpened = signal(false);

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
  readonly selectedVehicleTypeFilter = signal('');
  readonly selectedDate = signal<Date | string>('');

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
    if (this.selectedVehicleTypeFilter() === type) {
      this.selectedVehicleTypeFilter.set('');
    } else {
      this.selectedVehicleTypeFilter.set(type);
    }
  }

  onDateSelected(date: Date): void {
    this.selectedDate.set(date);
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
    if (this.selectedVehicleTypeFilter()) {
      const typeFilter = this.selectedVehicleTypeFilter();
      result = result.filter(b => {
        const type = b.vehicle?.vehicleTypeId || 'Sedan';
        if (typeFilter === 'Sedan') {
          return type === 'Sedan' || (!type || type !== 'Pickup' && type !== 'Van' && type !== 'SUV' && type !== 'Other');
        }
        return type === typeFilter;
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
    this.selectedVehicleTypeFilter.set('');
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
