import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../../../../core/models/booking.model';
import { BookingCalendar } from '../booking-calendar/booking-calendar';

@Component({
  selector: 'app-right-sidebar',
  standalone: true,
  imports: [CommonModule, BookingCalendar],
  templateUrl: './right-sidebar.html',
})
export class RightSidebar {
  @Input() currentDate: Date | string = '';
  @Input() bookings: Booking[] = [];
  @Input() isMobile = false;

  @Output() bookingClick = new EventEmitter<Booking>();
  @Output() closeDrawer = new EventEmitter<void>();
}
