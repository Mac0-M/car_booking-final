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
  @Input() showControls = true;
  @Input() flat = false;
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
  @Output() clickMore = new EventEmitter<Date>();
  @Input() showQuickFilters = false;
  @Input() selectedVehicleTypeFilter: string[] = [];
  @Input() showOldBookings = false;
  @Output() toggleVehicleType = new EventEmitter<string>();

  readonly vehicleTypes = VEHICLE_TYPES;

  private calendarInstance: any = null;
  private resizeObserver: any = null;
  private resizeRafId: number | null = null; // เพิ่ม
  private wasMobile = window.innerWidth < 1024;
  calendarView: "month" | "week" | "day" = "month";
  monthYearLabel = "";

  @HostListener("window:resize")
  onResize(): void {
    const isMobile = window.innerWidth < 1024;
    if (isMobile !== this.wasMobile) {
      this.wasMobile = isMobile;
      this.initCalendar();
    }
  }

  ngOnInit(): void {
    this.calendarView = this.defaultView;
    const initialDate = this._currentDate
      ? new Date(this._currentDate)
      : new Date();
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

  onMonthInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value && this.calendarInstance) {
      const parts = input.value.split('-');
      if (parts.length >= 2) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const selectedDate = new Date(year, month, 1);
        this.calendarInstance.setDate(selectedDate);
        this.updateMonthYearLabel();
        this.dateSelect.emit(selectedDate);
      }
    }
  }

  triggerMonthPicker(event: Event, input: HTMLInputElement): void {
    event.preventDefault();
    if (input && typeof input.showPicker === 'function') {
      input.showPicker();
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
          visibleEventCount: isMobileScreen ? 0 : 1,
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
          },
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

      // Handle click on month grid cell natively to allow cell clicks with isReadOnly: true
      container.addEventListener("click", (event: MouseEvent) => {
        if (!this.calendarInstance) return;

        // Only handle cell clicks on mobile screen widths (< 1024px)
        const isMobileScreen = window.innerWidth < 1024;
        if (!isMobileScreen) {
          return;
        }

        const target = event.target as HTMLElement;

        // Ignore clicks on event elements so clickEvent details listener takes priority
        if (target.closest(".toastui-calendar-weekday-event") || target.closest(".toastui-calendar-event-item")) {
          return;
        }

        const cell = target.closest(".toastui-calendar-daygrid-cell");
        if (cell) {
          const cells = Array.from(container.querySelectorAll(".toastui-calendar-daygrid-cell"));
          const index = cells.indexOf(cell);
          if (index !== -1) {
            const rangeStartObj = this.calendarInstance.getDateRangeStart();
            const rangeStartDate = typeof rangeStartObj.toDate === "function"
              ? rangeStartObj.toDate()
              : new Date(rangeStartObj);

            const clickedDate = new Date(rangeStartDate.getTime());
            clickedDate.setDate(clickedDate.getDate() + index);
            this.clickMore.emit(clickedDate);
          }
        }
      });

      // Handle click on the exceed (+N) button to notify and prevent default
      this.calendarInstance.on("clickMoreEventsBtn", (eventInfo: any) => {
        console.log("clickMoreEventsBtn triggered:", eventInfo);
        if (eventInfo && eventInfo.nativeEvent) {
          eventInfo.nativeEvent.preventDefault();
        }

        let date: Date;
        if (eventInfo && eventInfo.date) {
          if (eventInfo.date instanceof Date) {
            date = eventInfo.date;
          } else if (typeof eventInfo.date.toDate === "function") {
            date = eventInfo.date.toDate();
          } else if (typeof eventInfo.date.getTime === "function") {
            date = new Date(eventInfo.date.getTime());
          } else if (eventInfo.date.d instanceof Date) {
            date = eventInfo.date.d;
          } else {
            date = new Date(eventInfo.date);
          }
        } else {
          date = new Date();
        }

        this.clickMore.emit(date);
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
    if (b.status === "COMPLETED" || b.status === "CANCELLED") return true;
    // Auto-complete: CONFIRMED but past return time
    if (b.status === "CONFIRMED") {
      const returnTime = new Date((b.return || "").replace(" ", "T"));
      if (!isNaN(returnTime.getTime()) && returnTime < new Date()) return true;
    }
    return false;
  }

  private renderCalendarEvents(): void {
    if (!this.calendarInstance) return;

    const events = this.bookings.map((b) => {
      const isOld = this.isOldBooking(b);

      let color = "#0ea5e9"; // Premium blue-500 for Sedan
      let borderColor = "#0284c7"; // Premium blue-600
      let icon = "directions_car";

      const type = b.vehicle?.vehicleTypeId;
      if (type === "Pickup") {
        color = "#be3350"; // Premium red-500
        borderColor = "#982840"; // Premium red-600
        icon = "local_shipping";
      } else if (type === "Van") {
        color = "#d25414"; // Premium orange-500
        borderColor = "#aa410d"; // Premium orange-600
        icon = "airport_shuttle";
      } else if (type === "SUV") {
        color = "#2b9f6f"; // Premium emerald-500
        borderColor = "#207a54"; // Premium emerald-600
        icon = "time_to_leave";
      } else if (type === "Other") {
        color = "#7542d9"; // Premium violet-500
        borderColor = "#5c30b2"; // Premium violet-600
        icon = "commute";
      }

      // Old bookings get gray background
      if (isOld) {
        color = "#7c8fa6"; // Premium gray-400
        borderColor = "#52647c"; // Premium gray-500
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
        isReadOnly: true,
        raw: {
          icon: icon,
        },
      };
    });

    this.calendarInstance.clear();
    this.calendarInstance.createEvents(events);
  }
}
