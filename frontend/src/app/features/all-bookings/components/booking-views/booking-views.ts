import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../../../../core/models/booking.model';
import { BookingCalendar } from '../booking-calendar/booking-calendar';
import { BookingCard } from '../booking-card/booking-card';
import { AllSharedUi } from '../../../../shared/shared';

@Component({
  selector: 'app-booking-views',
  standalone: true,
  imports: [CommonModule, BookingCalendar, BookingCard, ...AllSharedUi],
  templateUrl: './booking-views.html',
  host: {
    class: 'flex-1 min-h-0 w-full flex flex-col overflow-hidden'
  }
})
export class BookingViews {
  @Input() viewMode: 'calendar' | 'grid' | 'list' = 'calendar';
  @Input() bookings: Booking[] = [];
  @Input() selectedVehicleTypeFilter: string[] = [];
  @Input() isMobile = false;
  @Input() showOldBookings = false;
  @Input() currentDate: Date | string = '';

  @Output() toggleVehicleType = new EventEmitter<string>();
  @Output() bookingClick = new EventEmitter<Booking>();
  @Output() dateSelect = new EventEmitter<Date>();
  @Output() clickMore = new EventEmitter<Date>();

  getBookingStatusVariant(booking: Booking): 'available' | 'pending' | 'booked' | 'unavailable' {
    if (booking.status === 'CANCELLED') return 'unavailable';
    if (booking.status === 'COMPLETED') return 'booked';

    const now = new Date();
    const cleanTime = (t: string) => {
      return new Date(t.replace(' ', 'T'));
    };

    const departTime = cleanTime(booking.depart || '');
    const returnTime = cleanTime(booking.return || '');

    // Auto-complete: past return time = completed
    if (!isNaN(returnTime.getTime()) && returnTime < now) {
      return 'booked';
    }

    if (now < departTime) {
      return 'available';
    } else {
      return 'pending';
    }
  }
}
