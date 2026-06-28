import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BookingService } from '../../../../core/services/booking.service';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { UserService } from '../../../../core/services/user.service';
import { Booking } from '../../../../core/models/booking.model';
import { Vehicle } from '../../../../core/models/vehicle.model';
import { User } from '../../../../core/models/user.model';
import { AllSharedUi } from '../../../../shared/shared';
import { BookingDetailModal } from './components/booking-detail-modal/booking-detail-modal';
import { BookingCalendar } from './components/booking-calendar/booking-calendar';
import { BookingCard } from '../../components/booking-card/booking-card';
import { BookingFilters } from '../../components/booking-filters/booking-filters';
import { AuthService } from '../../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ...AllSharedUi, BookingDetailModal, BookingCalendar, BookingCard, BookingFilters],
  templateUrl: './booking-list.html',
})
export class BookingList implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly vehicleService = inject(VehicleService);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly selectedBooking = signal<Booking | null>(null);
  readonly isModalOpen = signal(false);
  
  // View Mode
  readonly viewMode = signal<'calendar' | 'block'>('calendar');

  // Filters State
  readonly searchQuery = signal('');
  readonly selectedVehicleId = signal('');
  readonly selectedUserId = signal('');
  readonly startDate = signal('');
  readonly endDate = signal('');

  // Dropdown Lists
  readonly vehiclesList = signal<Vehicle[]>([]);
  readonly usersList = signal<User[]>([]);

  get isAdmin(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'Admin' || role === 'Super_Admin';
  }

  ngOnInit(): void {
    // Load dropdown lists for filter dropdowns
    this.vehicleService.findAll().subscribe(res => this.vehiclesList.set(res));
    this.userService.findAll().subscribe(res => this.usersList.set(res));
    
    // Load bookings
    this.loadBookings();
  }

  setViewMode(mode: 'calendar' | 'block'): void {
    this.viewMode.set(mode);
  }

  loadBookings(): void {
    const filters: any = {
      status: 'booked', // This page only shows active bookings
    };

    if (this.selectedVehicleId()) {
      filters.vehicle_id = Number(this.selectedVehicleId());
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

    // Sort by travel date descending, then start time descending
    return [...result].sort((a, b) => {
      if (a.bookingDate !== b.bookingDate) {
        return b.bookingDate.localeCompare(a.bookingDate);
      }
      return b.startTime.localeCompare(a.startTime);
    });
  });

  resetFilters(): void {
    this.selectedVehicleId.set('');
    this.selectedUserId.set('');
    this.startDate.set('');
    this.endDate.set('');
    this.searchQuery.set('');
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
    const isConfirmed = confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้?');
    if (isConfirmed) {
      this.bookingService.cancelBooking(id).subscribe({
        next: () => {
          this.closeDetail();
          this.loadBookings();
        },
        error: (err: any) => {
          alert(err.error?.message || 'เกิดข้อผิดพลาดในการยกเลิกการจอง กรุณาลองใหม่อีกครั้ง');
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
        alert(err.error?.message || 'เกิดข้อผิดพลาดในการเสร็จสิ้นการจอง กรุณาลองใหม่อีกครั้ง');
      }
    });
  }

}
