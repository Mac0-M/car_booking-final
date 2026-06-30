import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../../../../core/models/booking.model';
import { VEHICLE_TYPES } from '../../../../core/models/vehicle.model';


@Component({
  selector: 'app-booking-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-calendar.html',
})
export class BookingCalendar implements OnInit, AfterViewInit, OnDestroy {
  private _bookings: Booking[] = [];

  @Input() calendarId = 'calendar-container-' + Math.random().toString(36).substring(2, 9);
  @Input() defaultView: 'month' | 'week' | 'day' = 'month';
  @Input() showViewSwitcher = true;
  @Input() showLegend = true;
  @Input() height = '720px';
  @Input() minHeight = '850px';

  @Input()
  set bookings(value: Booking[]) {
    this._bookings = value || [];
    this.renderCalendarEvents();
  }
  get bookings(): Booking[] {
    return this._bookings;
  }

  private _currentDate: Date | string = '';

  @Input()
  set currentDate(value: Date | string) {
    this._currentDate = value;
    if (this.calendarInstance && value) {
      this.calendarInstance.setDate(value);
    }
  }
  get currentDate(): Date | string {
    return this._currentDate;
  }

  @Output() bookingClick = new EventEmitter<Booking>();
  @Output() dateSelect = new EventEmitter<Date>();
  @Input() showQuickFilters = false;
  @Input() selectedVehicleTypeFilter = '';
  @Output() toggleVehicleType = new EventEmitter<string>();

  readonly vehicleTypes = VEHICLE_TYPES;


  private calendarInstance: any = null;
  private resizeObserver: any = null;
  calendarView: 'month' | 'week' | 'day' = 'month';

  ngOnInit(): void {
    this.calendarView = this.defaultView;
  }

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
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private initCalendar(): void {
    setTimeout(() => {
      const container = document.getElementById(this.calendarId);
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
        defaultView: this.defaultView,
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

      if (this._currentDate) {
        this.calendarInstance.setDate(this._currentDate);
      }

      // Handle event click to view details
      this.calendarInstance.on('clickEvent', (eventInfo: any) => {
        const bookingId = eventInfo.event.id;
        const booking = this.bookings.find(b => b.id === bookingId);
        if (booking) {
          this.bookingClick.emit(booking);
        }
      });

      // Handle click on grid cell/date to notify date selection
      this.calendarInstance.on('selectDateTime', (eventInfo: any) => {
        const date = eventInfo.start instanceof Date ? eventInfo.start : new Date(eventInfo.start);
        this.dateSelect.emit(date);
      });

      // Observe container size changes to render calendar correctly
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => {
          if (this.calendarInstance) {
            this.calendarInstance.render();
          }
        });
        this.resizeObserver.observe(container);
      }

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
          color = '#ef4444'; // Red (แดง)
          borderColor = '#dc2626';
          icon = 'local_shipping';
        } else if (type === 'Van') {
          color = '#f97316'; // Orange (ส้ม)
          borderColor = '#ea580c';
          icon = 'airport_shuttle';
        } else if (type === 'SUV') {
          color = '#10b981'; // Green (เขียว)
          borderColor = '#059669';
          icon = 'time_to_leave';
        } else if (type === 'Other') {
          color = '#8b5cf6'; // Purple (ม่วง)
          borderColor = '#7c3aed';
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
