import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  AfterViewInit,
  OnDestroy,
  HostListener,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Booking } from "../../../../core/models/booking.model";
import { VEHICLE_TYPES } from "../../../../core/models/vehicle.model";
import { THAI_MONTHS } from "../../../../shared/pipes/thai-date.pipe";
import { AllSharedUi } from "../../../../shared/shared";

@Component({
  selector: "app-booking-calendar",
  standalone: true,
  imports: [CommonModule, AllSharedUi],
  templateUrl: "./booking-calendar.html",
})
export class BookingCalendar implements OnInit, AfterViewInit, OnDestroy {
  private _bookings: Booking[] = [];

  @Input() calendarId =
    "calendar-container-" + Math.random().toString(36).substring(2, 9);
  @Input() defaultView: "month" | "week" | "day" = "month";
  @Input() showViewSwitcher = true;
  @Input() showLegend = true;
  @Input() height = "720px";
  @Input() minHeight = "850px";

  @Input()
  set bookings(value: Booking[]) {
    this._bookings = value || [];
    this.renderCalendarEvents();
  }
  get bookings(): Booking[] {
    return this._bookings;
  }

  private _currentDate: Date | string = "";

  @Input()
  set currentDate(value: Date | string) {
    this._currentDate = value;
    if (this.calendarInstance && value) {
      this.calendarInstance.setDate(value);
      this.updateMonthYearLabel();
    }
  }
  get currentDate(): Date | string {
    return this._currentDate;
  }

  @Output() bookingClick = new EventEmitter<Booking>();
  @Output() dateSelect = new EventEmitter<Date>();
  @Input() showQuickFilters = false;
  @Input() selectedVehicleTypeFilter = "";
  @Input() showOldBookings = false;
  @Output() toggleVehicleType = new EventEmitter<string>();

  readonly vehicleTypes = VEHICLE_TYPES;

  private calendarInstance: any = null;
  private resizeObserver: any = null;
  private resizeRafId: number | null = null; // เพิ่ม
  private wasMobile = window.innerWidth < 1024;
  calendarView: "month" | "week" | "day" = "month";
  monthYearLabel = "";

  @HostListener('window:resize')
  onResize(): void {
    const isMobile = window.innerWidth < 1024;
    if (isMobile !== this.wasMobile) {
      this.wasMobile = isMobile;
      this.initCalendar();
    }
  }

  ngOnInit(): void {
    this.calendarView = this.defaultView;
    const initialDate = this._currentDate ? new Date(this._currentDate) : new Date();
    const month = THAI_MONTHS[initialDate.getMonth()];
    const year = initialDate.getFullYear() + 543;
    this.monthYearLabel = `${month} ${year}`;
  }

  changeView(viewName: "month" | "week" | "day"): void {
    this.calendarView = viewName;
    if (this.calendarInstance) {
      this.calendarInstance.changeView(viewName);
      this.updateMonthYearLabel();
    }
  }

  prev(): void {
    if (this.calendarInstance) {
      this.calendarInstance.prev();
      this.updateMonthYearLabel();
    }
  }

  next(): void {
    if (this.calendarInstance) {
      this.calendarInstance.next();
      this.updateMonthYearLabel();
    }
  }

  today(): void {
    if (this.calendarInstance) {
      this.calendarInstance.today();
      this.updateMonthYearLabel();
    }
  }

  updateMonthYearLabel(): void {
    if (this.calendarInstance) {
      const currentDate = this.calendarInstance.getDate();
      const month = THAI_MONTHS[currentDate.getMonth()];
      const year = currentDate.getFullYear() + 543;
      this.monthYearLabel = `${month} ${year}`;
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
    if (this.resizeRafId !== null) {
      // เพิ่ม - กัน leak
      cancelAnimationFrame(this.resizeRafId);
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
        console.error("TUI Calendar script not loaded");
        return;
      }

      const isMobileScreen = window.innerWidth < 1024;
      this.calendarInstance = new tuiCalendar(container, {
        defaultView: this.defaultView,
        useFormPopup: false,
        useDetailPopup: false,
        isReadOnly: true,
        month: {
          visibleEventCount: isMobileScreen ? 0 : 3,
        },
        gridSelection: {
          enableClick: true,
        },
        week: {
          taskView: false,
        },
        template: {
          time(event: any) {
            const icon = event.raw?.icon || "directions_car";
            return `<span class="flex items-center gap-1 overflow-hidden text-ellipsis py-0.5 px-1"><span class="material-icons text-xs shrink-0">${icon}</span> <span class="truncate font-sans font-medium text-xs">${event.title}</span></span>`;
          },
          allday(event: any) {
            const icon = event.raw?.icon || "directions_car";
            return `<span class="flex items-center gap-1 overflow-hidden text-ellipsis py-0.5 px-1"><span class="material-icons text-xs shrink-0">${icon}</span> <span class="truncate font-sans font-medium text-xs">${event.title}</span></span>`;
          },
          monthGridHeaderExceed(hiddenSchedules: number) {
            return `+${hiddenSchedules}`;
          }
        },
      });

      if (this._currentDate) {
        this.calendarInstance.setDate(this._currentDate);
      }
      this.updateMonthYearLabel();

      // Handle event click to view details
      this.calendarInstance.on("clickEvent", (eventInfo: any) => {
        const bookingId = eventInfo.event.id;
        const booking = this.bookings.find((b) => b.id === bookingId);
        if (booking) {
          this.bookingClick.emit(booking);
        }
      });

      // Handle click on grid cell/date to notify date selection
      this.calendarInstance.on("selectDateTime", (eventInfo: any) => {
        const date =
          eventInfo.start instanceof Date
            ? eventInfo.start
            : new Date(eventInfo.start);
        this.dateSelect.emit(date);
      });

      // Observe container size changes to render calendar correctly
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      if (typeof ResizeObserver !== "undefined") {
        this.resizeObserver = new ResizeObserver(() => {
          // รวม event ที่ถี่เกินไปตอนลาก ให้ render แค่ครั้งเดียวต่อ 1 เฟรม
          if (this.resizeRafId !== null) {
            cancelAnimationFrame(this.resizeRafId);
          }
          this.resizeRafId = requestAnimationFrame(() => {
            if (this.calendarInstance) {
              this.calendarInstance.render();
            }
            this.resizeRafId = null;
          });
        });
        this.resizeObserver.observe(container);
      }

      this.renderCalendarEvents();
    }, 50);
  }

  /** Check if booking is old (completed, cancelled, or auto-complete past return time) */
  private isOldBooking(b: Booking): boolean {
    if (b.status === 'COMPLETED' || b.status === 'CANCELLED') return true;
    // Auto-complete: CONFIRMED but past return time
    if (b.status === 'CONFIRMED') {
      const returnTime = new Date((b.return || '').replace(' ', 'T'));
      if (!isNaN(returnTime.getTime()) && returnTime < new Date()) return true;
    }
    return false;
  }

  private renderCalendarEvents(): void {
    if (!this.calendarInstance) return;

    const events = this.bookings
      .map((b) => {
        const isOld = this.isOldBooking(b);

        let color = "#3b82f6"; // Blue for Sedan
        let borderColor = "#2563eb";
        let icon = "directions_car";

        const type = b.vehicle?.vehicleTypeId;
        if (type === "Pickup") {
          color = "#ef4444";
          borderColor = "#dc2626";
          icon = "local_shipping";
        } else if (type === "Van") {
          color = "#f97316";
          borderColor = "#ea580c";
          icon = "airport_shuttle";
        } else if (type === "SUV") {
          color = "#10b981";
          borderColor = "#059669";
          icon = "time_to_leave";
        } else if (type === "Other") {
          color = "#8b5cf6";
          borderColor = "#7c3aed";
          icon = "commute";
        }

        // Old bookings get gray background
        if (isOld) {
          color = "#9ca3af";
          borderColor = "#6b7280";
        }

        return {
          id: b.id,
          calendarId: "cal1",
          title: `${b.vehicle?.model || "Booked"} - ${b.userName.split(" ")[0]}`,
          start: (b.depart || "").replace(" ", "T"),
          end: (b.return || "").replace(" ", "T"),
          category: "time",
          backgroundColor: color,
          borderColor: borderColor,
          color: "#ffffff",
          raw: {
            icon: icon,
          },
        };
      });

    this.calendarInstance.clear();
    this.calendarInstance.createEvents(events);
  }
}
