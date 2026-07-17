import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  AfterViewInit,
  OnDestroy,
  HostListener,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Booking } from "../../../../core/models/booking.model";
import { VEHICLE_TYPES } from "../../../../core/models/vehicle.model";
import { AllSharedUi } from "../../../../shared/shared";
import { LanguageService } from "../../../../core/services/language.service";

import { VEHICLE_STYLES } from "./booking-calendar.constants";
import { parseTuiDate, getCellDate } from "./booking-calendar.utils";

@Component({
  selector: "app-booking-calendar",
  standalone: true,
  imports: [CommonModule, AllSharedUi],
  templateUrl: "./booking-calendar.html",
})
export class BookingCalendar implements OnInit, AfterViewInit, OnDestroy {
  private _bookings: Booking[] = [];
  private _currentDate: Date | string = "";

  @Input() calendarId = "calendar-container-" + Math.random().toString(36).substring(2, 9);
  @Input() defaultView: "month" | "week" | "day" = "month";
  @Input() showViewSwitcher = true;
  @Input() showControls = true;
  @Input() flat = false;
  @Input() showLegend = true;
  @Input() height = "720px";
  @Input() minHeight = "850px";
  @Input() showQuickFilters = false;
  @Input() selectedVehicleTypeFilter: string[] = [];
  @Input() showOldBookings = false;

  @Input()
  set bookings(value: Booking[]) {
    this._bookings = value || [];
    this.renderCalendarEvents();
  }
  get bookings(): Booking[] {
    return this._bookings;
  }

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
  @Output() clickMore = new EventEmitter<Date>();
  @Output() toggleVehicleType = new EventEmitter<string>();

  readonly vehicleTypes = VEHICLE_TYPES;
  private readonly langService = inject(LanguageService);

  private calendarInstance: any = null;
  private resizeObserver: any = null;
  private resizeRafId: number | null = null;
  private wasMobile = window.innerWidth < 1024;
  calendarView: "month" | "week" | "day" = "month";

  get activeCalendarDate(): Date {
    let d = this._currentDate ? new Date(this._currentDate) : new Date();
    if (this.calendarInstance) {
      try {
        d = this.calendarInstance.getDate();
      } catch (e) {}
    }
    return d;
  }

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
  }

  ngAfterViewInit(): void {
    this.initCalendar();
  }

  ngOnDestroy(): void {
    if (this.calendarInstance) this.calendarInstance.destroy();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.resizeRafId !== null) cancelAnimationFrame(this.resizeRafId);
  }

  changeView(viewName: "month" | "week" | "day"): void {
    this.calendarView = viewName;
    if (this.calendarInstance) this.calendarInstance.changeView(viewName);
  }

  prev(): void {
    if (this.calendarInstance) this.calendarInstance.prev();
  }

  next(): void {
    if (this.calendarInstance) this.calendarInstance.next();
  }

  today(): void {
    if (this.calendarInstance) this.calendarInstance.today();
  }

  onMonthInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value && this.calendarInstance) {
      const parts = input.value.split("-");
      if (parts.length >= 2) {
        const selectedDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
        this.calendarInstance.setDate(selectedDate);
        this.dateSelect.emit(selectedDate);
      }
    }
  }

  triggerMonthPicker(event: Event, input: HTMLInputElement): void {
    event.preventDefault();
    if (input && typeof input.showPicker === "function") {
      input.showPicker();
    }
  }

  private initCalendar(): void {
    setTimeout(() => {
      const container = document.getElementById(this.calendarId);
      if (!container) return;

      if (this.calendarInstance) this.calendarInstance.destroy();

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
        month: { visibleEventCount: isMobileScreen ? 0 : 1 },
        gridSelection: { enableClick: true },
        week: { taskView: false },
        template: {
          time: (event: any) => {
            const icon = event.raw?.icon || "directions_car";
            return `<span class="flex items-center gap-1 overflow-hidden text-ellipsis py-0.5 px-1"><span class="material-icons text-xs shrink-0">${icon}</span> <span class="truncate font-sans font-medium text-xs">${event.title}</span></span>`;
          },
          allday: (event: any) => {
            const icon = event.raw?.icon || "directions_car";
            return `<span class="flex items-center gap-1 overflow-hidden text-ellipsis py-0.5 px-1"><span class="material-icons text-xs shrink-0">${icon}</span> <span class="truncate font-sans font-medium text-xs">${event.title}</span></span>`;
          },
          monthGridHeaderExceed: (hiddenSchedules: number) => {
            return `<span class="custom-exceed-btn font-bold text-xs" style="display: block; width: 100%; height: 100%; cursor: pointer;">+${hiddenSchedules}</span>`;
          },
        },
      });

      if (this._currentDate) this.calendarInstance.setDate(this._currentDate);

      this.calendarInstance.on("clickEvent", (eventInfo: any) => {
        const booking = this.bookings.find((b) => b.id === eventInfo.event.id);
        if (booking) this.bookingClick.emit(booking);
      });

      container.addEventListener("click", (event: MouseEvent) => {
        if (!this.calendarInstance) return;

        const target = event.target as HTMLElement;
        const exceedBtn = target.closest(".custom-exceed-btn") || target.closest(".toastui-calendar-month-grid-header-exceed");
        const cell = target.closest(".toastui-calendar-daygrid-cell");

        if (exceedBtn) {
          event.stopPropagation();
          event.preventDefault();
          if (cell) {
            const date = getCellDate(cell, container, this.calendarInstance);
            if (date) this.clickMore.emit(date);
          }
          return;
        }

        if (window.innerWidth >= 1024 || target.closest(".toastui-calendar-weekday-event") || target.closest(".toastui-calendar-event-item")) {
          return;
        }

        if (cell) {
          const date = getCellDate(cell, container, this.calendarInstance);
          if (date) this.clickMore.emit(date);
        }
      });

      this.calendarInstance.on("clickMoreEventsBtn", (eventInfo: any) => {
        this.clickMore.emit(parseTuiDate(eventInfo?.date));
      });

      if (this.resizeObserver) this.resizeObserver.disconnect();
      if (typeof ResizeObserver !== "undefined") {
        this.resizeObserver = new ResizeObserver(() => {
          if (this.resizeRafId !== null) cancelAnimationFrame(this.resizeRafId);
          this.resizeRafId = requestAnimationFrame(() => {
            if (this.calendarInstance) this.calendarInstance.render();
            this.resizeRafId = null;
          });
        });
        this.resizeObserver.observe(container);
      }

      this.renderCalendarEvents();
    }, 50);
  }

  private isOldBooking(b: Booking): boolean {
    if (b.status === "COMPLETED" || b.status === "CANCELLED") return true;
    if (b.status === "CONFIRMED" && b.return) {
      const returnTime = new Date(b.return.replace(" ", "T"));
      return !isNaN(returnTime.getTime()) && returnTime < new Date();
    }
    return false;
  }

  private renderCalendarEvents(): void {
    if (!this.calendarInstance) return;

    const events = this.bookings.map((b) => {
      const isOld = this.isOldBooking(b);
      const type = b.vehicle?.vehicleTypeId || "Sedan";
      
      let { color, borderColor, icon } = VEHICLE_STYLES[type] || VEHICLE_STYLES["Sedan"];

      if (isOld) {
        color = "#726751";
        borderColor = "#615743";
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
        raw: { icon },
      };
    });

    this.calendarInstance.clear();
    this.calendarInstance.createEvents(events);
  }
}
