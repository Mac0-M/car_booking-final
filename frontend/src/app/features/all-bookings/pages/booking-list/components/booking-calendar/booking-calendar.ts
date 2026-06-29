import { Component, Input, Output, EventEmitter, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../../../../../../core/models/booking.model';

@Component({
  selector: 'app-booking-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-calendar.html',
})
export class BookingCalendar implements AfterViewInit, OnDestroy {
  private _bookings: Booking[] = [];

  @Input()
  set bookings(value: Booking[]) {
    this._bookings = value || [];
    this.renderCalendarEvents();
  }
  get bookings(): Booking[] {
    return this._bookings;
  }

  @Output() bookingClick = new EventEmitter<Booking>();

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

  ngAfterViewInit(): void {
    this.initCalendar();
  }

  ngOnDestroy(): void {
    if (this.calendarInstance) {
      this.calendarInstance.destroy();
    }
  }

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
        useFormPopup: false,
        useDetailPopup: false,
        isReadOnly: true,
        month: {  
          visibleEventCount: 3,
        },
        gridSelection: {
          enableClick: true,
        },
        week: {
          taskView: false,
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
        const booking = this.bookings.find(b => b.id === bookingId);
        if (booking) {
          this.bookingClick.emit(booking);
        }
      });

      this.renderCalendarEvents();
    }, 50);
  }

  private renderCalendarEvents(): void {
    if (!this.calendarInstance) return;

    const events = this.bookings
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
          title: `${b.vehicle?.model || 'Booked'} - ${b.userName.split(' ')[0]}`,
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
