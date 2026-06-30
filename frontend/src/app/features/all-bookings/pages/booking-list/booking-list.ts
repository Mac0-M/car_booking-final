import { Component, inject, signal, computed, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../../core/services/booking.service';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { UserService } from '../../../../core/services/user.service';
import { Booking } from '../../../../core/models/booking.model';
import { Vehicle } from '../../../../core/models/vehicle.model';
import { User } from '../../../../core/models/user.model';
import { AllSharedUi } from '../../../../shared/shared';
import { BookingDialogService } from '../../../booking/booking-dialog.service';
import { BookingDetailModal } from '../../components/booking-detail-modal/booking-detail-modal';
import { LeftSidebar } from '../../components/left-sidebar/left-sidebar';
import { BookingViews } from '../../components/booking-views/booking-views';
import { AuthService } from '../../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ...AllSharedUi, BookingDetailModal, BookingViews, LeftSidebar, MatSidenavModule],
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
  
  // Responsive drawer states
  readonly isMobile = signal(window.innerWidth < 768);
  readonly leftDrawerOpened = signal(window.innerWidth >= 768);



  @HostListener('window:resize')
  onResize(): void {
    const mobile = window.innerWidth < 768;
    this.isMobile.set(mobile);
    this.leftDrawerOpened.set(!mobile);
  }

  // Dashboard Tab state
  readonly activeTab = signal<'active' | 'history'>('active');

  // View Mode
  readonly viewMode = signal<'calendar' | 'grid' | 'list'>('calendar');

  // Filters State
  readonly searchQuery = signal('');
  readonly selectedUserId = signal('');
  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly selectedStatusFilter = signal('');
  readonly showFilters = signal(false);
  readonly selectedVehicleTypeFilter = signal('');
  readonly selectedDate = signal<Date | string>('');

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
    
    // Load bookings
    this.loadBookings();
  }

  setActiveTab(tab: 'active' | 'history'): void {
    this.activeTab.set(tab);
    if (tab === 'active') {
      this.viewMode.set('calendar');
    } else {
      this.viewMode.set('grid');
    }
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


  loadBookings(): void {
    const filters: any = {};

    if (this.activeTab() === 'active') {
      filters.status = 'booked';
    } else if (this.selectedStatusFilter()) {
      // Map CONFIRMED -> booked, COMPLETED -> complete, CANCELLED -> cancel
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

  // Filter bookings locally by search query only (database handled user/vehicle/date)
  readonly filteredBookings = computed(() => {
    const list = this.bookingService.bookings();
    const query = this.searchQuery().toLowerCase().trim();

    let result = list;

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

    // Sort by travel date descending, then start time descending
    return [...result].sort((a, b) => {
      if (a.bookingDate !== b.bookingDate) {
        return b.bookingDate.localeCompare(a.bookingDate);
      }
      return b.startTime.localeCompare(a.startTime);
    });
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
