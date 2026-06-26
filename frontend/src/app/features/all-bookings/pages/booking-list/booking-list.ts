import { Component, inject, signal, computed, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
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
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ...AllSharedUi, BookingDetailModal],
  templateUrl: './booking-list.html',
})
export class BookingList implements OnInit, OnDestroy, AfterViewInit {
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
  readonly showAdvancedFilters = signal(false);
  readonly selectedVehicleId = signal('');
  readonly selectedUserId = signal('');
  readonly startDate = signal('');
  readonly endDate = signal('');

  // Dropdown Lists
  readonly vehiclesList = signal<Vehicle[]>([]);
  readonly usersList = signal<User[]>([]);

  // TUI Calendar Instance
  private calendarInstance: any = null;
  calendarView: 'month' | 'week' | 'day' = 'month';

  changeView(viewName: 'month' | 'week' | 'day'): void {
    this.calendarView = viewName;
    if (this.calendarInstance) {
      this.calendarInstance.changeView(viewName);
    }
  }

  prev(): void {
    if (this.calendarInstance) {
      this.calendarInstance.prev();
    }
  }

  next(): void {
    if (this.calendarInstance) {
      this.calendarInstance.next();
    }
  }

  today(): void {
    if (this.calendarInstance) {
      this.calendarInstance.today();
    }
  }

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

  ngAfterViewInit(): void {
    if (this.viewMode() === 'calendar') {
      this.initCalendar();
    }
  }

  ngOnDestroy(): void {
    if (this.calendarInstance) {
      this.calendarInstance.destroy();
    }
  }

  setViewMode(mode: 'calendar' | 'block'): void {
    this.viewMode.set(mode);
    if (mode === 'calendar') {
      this.initCalendar();
    } else {
      if (this.calendarInstance) {
        this.calendarInstance.destroy();
        this.calendarInstance = null;
      }
    }
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
      next: () => {
        if (this.viewMode() === 'calendar') {
          this.renderCalendarEvents();
        }
      },
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

  getBookingStatusVariant(booking: Booking): 'available' | 'pending' | 'booked' | 'unavailable' {
    // Check status
    if (booking.status === 'CANCELLED') return 'unavailable';
    if (booking.status === 'COMPLETED') return 'booked';

    const now = new Date();
    const cleanTime = (t: string) => {
      // e.g. "2026-06-26 13:00:00"
      return new Date(t.replace(' ', 'T'));
    };

    const departTime = cleanTime(booking.depart || '');
    const returnTime = cleanTime(booking.return || '');

    if (now < departTime) {
      return 'available'; // Upcoming
    } else if (now > returnTime) {
      return 'booked'; // Past but not complete yet
    } else {
      return 'pending'; // Ongoing
    }
  }

  getBookingStatusLabel(booking: Booking): string {
    const state = this.getBookingStatusVariant(booking);
    if (state === 'available') return 'Upcoming (ยังไม่เดินทาง)';
    if (state === 'pending') return 'Ongoing (กำลังเดินทาง)';
    if (state === 'booked') return 'Completed (เสร็จสิ้น)';
    return 'Cancelled (ยกเลิก)';
  }

  getVehicleImgUrl(vehicle: any): string {
    if (!vehicle || !vehicle.vehicleImg) {
      return '';
    }
    if (vehicle.vehicleImg.startsWith('http') || vehicle.vehicleImg.startsWith('blob:')) {
      return vehicle.vehicleImg;
    }
    const baseUrl = environment.apiUrl.replace('/api/v1', '');
    const imgPath = vehicle.vehicleImg.startsWith('/') ? vehicle.vehicleImg : `/${vehicle.vehicleImg}`;
    return `${baseUrl}${imgPath}`;
  }

  // --- Toast UI Calendar Integration ---
  private initCalendar(): void {
    setTimeout(() => {
      const container = document.getElementById('calendar-container');
      if (!container) return;

      if (this.calendarInstance) {
        this.calendarInstance.destroy();
      }

      const tuiCalendar = (window as any).tui?.Calendar;
      if (!tuiCalendar) {
        console.error('TUI Calendar script not loaded');
        return;
      }

      this.calendarInstance = new tuiCalendar(container, {
        defaultView: 'month',
        month: {
    visibleEventCount: 6
  },
        useFormPopup: false,
        useDetailPopup: false,
        isReadOnly: true,
        gridSelection: {
          enableClick: true,
        },
        template: {
          time(event: any) {
            const icon = event.raw?.icon || 'directions_car';
            return `<span class="flex items-center gap-1 overflow-hidden text-ellipsis py-0.5 px-1"><span class="material-icons text-xs shrink-0">${icon}</span> <span class="truncate font-sans font-medium text-xs">${event.title}</span></span>`;
          },
          allday(event: any) {
            const icon = event.raw?.icon || 'directions_car';
            return `<span class="flex items-center gap-1 overflow-hidden text-ellipsis py-0.5 px-1"><span class="material-icons text-xs shrink-0">${icon}</span> <span class="truncate font-sans font-medium text-xs">${event.title}</span></span>`;
          }
        }
      });



      // Handle event click to view details
      this.calendarInstance.on('clickEvent', (eventInfo: any) => {
        const bookingId = eventInfo.event.id;
        const booking = this.bookingService.bookings().find(b => b.id === bookingId);
        if (booking) {
          this.openDetail(booking);
        }
      });

      this.renderCalendarEvents();
    }, 50);
  }

  private renderCalendarEvents(): void {
    if (!this.calendarInstance) return;

    const events = this.filteredBookings()
      .filter(b => b.status !== 'COMPLETED')
      .map(b => {
      let color = '#3b82f6'; // Blue for Sedan
      let borderColor = '#2563eb';
      let icon = 'directions_car';

      const type = b.vehicle?.vehicleTypeId;
      if (type === 'Pickup') {
        color = '#10b981'; // Green
        borderColor = '#059669';
        icon = 'local_shipping';
      } else if (type === 'Van') {
        color = '#8b5cf6'; // Purple
        borderColor = '#7c3aed';
        icon = 'airport_shuttle';
      } else if (type === 'SUV') {
        color = '#f97316'; // Orange
        borderColor = '#ea580c';
        icon = 'time_to_leave';
      } else if (type === 'Other') {
        color = '#ec4899'; // Pink
        borderColor = '#db2777';
        icon = 'commute';
      }

      return {
        id: b.id,
        calendarId: 'cal1',
        title: `${b.vehicle?.model || 'จองรถ'} - ${b.userName.split(' ')[0]}`,
        start: (b.depart || '').replace(' ', 'T'),
        end: (b.return || '').replace(' ', 'T'),
        category: 'time',
        backgroundColor: color,
        borderColor: borderColor,
        color: '#ffffff',
        raw: {
          icon: icon
        }
      };
    });

    this.calendarInstance.clear();
    this.calendarInstance.createEvents(events);
  }
}
