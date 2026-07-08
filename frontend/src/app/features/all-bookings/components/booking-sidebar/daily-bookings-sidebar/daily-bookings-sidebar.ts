import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../../../../../core/models/booking.model';
import { BookingCalendar } from '../../booking-calendar/booking-calendar';
import { AllSharedUi } from '../../../../../shared/shared';

@Component({
  selector: 'app-daily-bookings-sidebar',
  standalone: true,
  imports: [CommonModule, BookingCalendar, ...AllSharedUi],
  templateUrl: './daily-bookings-sidebar.html',
  host: {
    class: 'h-full flex flex-col'
  }
})
export class DailyBookingsSidebar {
  @Input() selectedDailyDate: Date | null = null;
  @Input() dailyBookings: Booking[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() bookingClick = new EventEmitter<Booking>();
}

// Force IDE cache refresh and reload template validations

