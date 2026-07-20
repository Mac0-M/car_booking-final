import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  HostListener,
  effect,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { BookingService } from "../../../../core/services/booking.service";
import { HeaderService } from "../../../../core/services/header.service";
import { VehicleService } from "../../../../core/services/vehicle.service";
import { UserService } from "../../../../core/services/user.service";
import { Booking } from "../../../../core/models/booking.model";
import { Vehicle, VEHICLE_TYPES } from "../../../../core/models/vehicle.model";
import { User } from "../../../../core/models/user.model";
import { AllSharedUi } from "../../../../shared/shared";
import { BookingDialogService } from "../../add-booking/booking-dialog.service";
import { BookingDetailModal } from "../../components/booking-detail-modal/booking-detail-modal";
import { BookingViews } from "../../components/booking-views/booking-views";
import { AuthService } from "../../../../core/services/auth.service";
import { FormsModule } from "@angular/forms";
import { FilterSidebar } from "../../components/booking-sidebar/filter-sidebar/filter-sidebar";
import { MobileFilters } from "../../components/booking-sidebar/mobile-filters/mobile-filters";
import { MatSidenavModule } from "@angular/material/sidenav";
import { DailyBookingsSidebar } from "../../components/booking-sidebar/daily-bookings-sidebar/daily-bookings-sidebar";
import { LanguageService } from "../../../../core/services/language.service";
@Component({
  selector: "app-booking-list",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ...AllSharedUi,
    BookingDetailModal,
    BookingViews,
    FilterSidebar,
    MobileFilters,
    MatSidenavModule,
    DailyBookingsSidebar,
  ],
  templateUrl: "./booking-list.html",
})
export class BookingList implements OnInit, OnDestroy {
  private readonly bookingService = inject(BookingService);
  private readonly vehicleService = inject(VehicleService);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly bookingDialogService = inject(BookingDialogService);
  private readonly headerService = inject(HeaderService);
  private readonly langService = inject(LanguageService);

  @ViewChild(MobileFilters) mobileFiltersComponent?: MobileFilters;

  openBooking(): void {
    this.bookingDialogService.open();
  }

  readonly selectedBooking = signal<Booking | null>(null);
  readonly isModalOpen = signal(false);

  // Responsive
  readonly isMobile = signal(window.innerWidth < 1024);
  readonly leftDrawerOpened = signal(false);

  @HostListener("window:resize")
  onResize(): void {
    const mobile = window.innerWidth < 1024;
    this.isMobile.set(mobile);
    if (mobile && this.viewMode() === "list") {
      this.setViewMode("grid");
    }
  }

  // View Mode: calendar, grid, or list
  readonly viewMode = signal<"calendar" | "grid" | "list">("calendar");

  // Dashboard Tab state
  readonly activeTab = signal<"active" | "history">("active");

  // Filters State
  readonly searchQuery = signal("");
  readonly selectedUserId = signal("");
  readonly startDate = signal("");
  readonly endDate = signal("");
  readonly selectedStatusFilter = signal("");
  readonly showFilters = signal(false);
  readonly selectedVehicleTypeFilter = signal<string[]>([]);
  readonly selectedVehiclePlates = signal<string[]>([]);
  readonly selectedDate = signal<Date | string>("");
  readonly rightDrawerOpened = signal(false);
  readonly selectedDailyDate = signal<Date | null>(null);

  constructor() {
    // Load cached filters FIRST
    const cached = localStorage.getItem("booking_list_filters");
    if (cached) {
      try {
        const filters = JSON.parse(cached);
        if (filters.searchQuery !== undefined)
          this.searchQuery.set(filters.searchQuery);
        if (filters.selectedUserId !== undefined)
          this.selectedUserId.set(filters.selectedUserId);
        if (filters.startDate !== undefined)
          this.startDate.set(filters.startDate);
        if (filters.endDate !== undefined) this.endDate.set(filters.endDate);
        if (filters.selectedStatusFilter !== undefined)
          this.selectedStatusFilter.set(filters.selectedStatusFilter);
        if (filters.selectedVehicleTypeFilter !== undefined)
          this.selectedVehicleTypeFilter.set(filters.selectedVehicleTypeFilter);
        if (filters.selectedVehiclePlates !== undefined)
          this.selectedVehiclePlates.set(filters.selectedVehiclePlates);
        if (filters.activeTab !== undefined)
          this.activeTab.set(filters.activeTab);
        if (filters.selectedDate !== undefined) {
          this.selectedDate.set(
            filters.selectedDate ? new Date(filters.selectedDate) : "",
          );
        }
      } catch (e) {
        console.error("Error parsing cached filters:", e);
      }
    }

    // Register the effect
    effect(() => {
      const filters = {
        searchQuery: this.searchQuery(),
        selectedUserId: this.selectedUserId(),
        startDate: this.startDate(),
        endDate: this.endDate(),
        selectedStatusFilter: this.selectedStatusFilter(),
        selectedVehicleTypeFilter: this.selectedVehicleTypeFilter(),
        selectedVehiclePlates: this.selectedVehiclePlates(),
        activeTab: this.activeTab(),
        selectedDate: this.selectedDate(),
      };
      localStorage.setItem("booking_list_filters", JSON.stringify(filters));
    });

    // Sync with HeaderService for mobile filter button
    effect(
      () => {
        const mobile = this.isMobile();
        const count = this.activeFiltersCount();

        if (mobile) {
          this.headerService.isMobileFilterVisible.set(true);
          this.headerService.mobileFilterAction.set(() => {
            if (this.mobileFiltersComponent) {
              this.mobileFiltersComponent.openMobileFilters();
            }
          });
          this.headerService.clearFilterAction.set(() => {
            this.resetFilters();
          });
          this.headerService.activeFiltersCount.set(count);
        } else {
          this.headerService.reset();
        }
      },
      { allowSignalWrites: true },
    );
  }

  readonly activeFiltersCount = computed(() => {
    let count = 0;
    if (this.searchQuery().trim()) count++;
    if (this.selectedUserId()) count++;
    if (this.startDate()) count++;
    if (this.endDate()) count++;
    if (this.selectedStatusFilter()) count++;
    count += this.selectedVehicleTypeFilter().length;
    count += this.selectedVehiclePlates().length;
    if (this.selectedDate()) count++;
    return count;
  });

  readonly filteredVehiclesForPills = computed(() => {
    const selectedTypes = this.selectedVehicleTypeFilter();
    if (selectedTypes.length === 0) return [];

    const list = this.vehiclesList();
    const filtered = list.filter((v) => {
      const type = v.vehicleTypeId || "Sedan";
      if (selectedTypes.includes("Sedan")) {
        if (
          type === "Sedan" ||
          !type ||
          (type !== "Pickup" &&
            type !== "Van" &&
            type !== "SUV" &&
            type !== "Other")
        ) {
          return true;
        }
      }
      return selectedTypes.includes(type);
    });

    const typeOrder = ["Sedan", "Pickup", "Van", "SUV", "Other"];
    return filtered.sort((a, b) => {
      const typeA = a.vehicleTypeId || "Sedan";
      const typeB = b.vehicleTypeId || "Sedan";
      const idxA = typeOrder.indexOf(typeA);
      const idxB = typeOrder.indexOf(typeB);

      const actualIdxA = idxA !== -1 ? idxA : typeOrder.length;
      const actualIdxB = idxB !== -1 ? idxB : typeOrder.length;

      if (actualIdxA !== actualIdxB) {
        return actualIdxA - actualIdxB;
      }
      return (a.model || "").localeCompare(b.model || "", "th");
    });
  });

  readonly dailyBookings = computed(() => {
    const date = this.selectedDailyDate();
    if (!date) return [];
    const targetMidnight = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    ).getTime();

    return this.filteredBookings()
      .filter((b) => {
        if (!b.depart || !b.return) return false;
        const depDate = new Date(b.depart.replace(" ", "T"));
        const retDate = new Date(b.return.replace(" ", "T"));
        const depMidnight = new Date(
          depDate.getFullYear(),
          depDate.getMonth(),
          depDate.getDate(),
        ).getTime();
        const retMidnight = new Date(
          retDate.getFullYear(),
          retDate.getMonth(),
          retDate.getDate(),
        ).getTime();
        return targetMidnight >= depMidnight && targetMidnight <= retMidnight;
      })
      .sort(
        (a, b) =>
          new Date(a.depart.replace(" ", "T")).getTime() -
          new Date(b.depart.replace(" ", "T")).getTime(),
      );
  });

  readonly vehicleTypes = VEHICLE_TYPES;

  // Dropdown Lists
  readonly vehiclesList = signal<Vehicle[]>([]);
  readonly usersList = signal<User[]>([]);

  get isAdmin(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === "Admin" || role === "Super_Admin";
  }

  ngOnInit(): void {
    this.vehicleService
      .findAll()
      .subscribe((res) => this.vehiclesList.set(res));
    this.userService.findAll().subscribe((res) => {
      this.usersList.set(res.filter((u) => u.role === "User"));
    });

    this.loadBookings();
  }

  ngOnDestroy(): void {
    this.headerService.reset();
  }

  setActiveTab(tab: "active" | "history"): void {
    if (tab === this.activeTab()) {
      const nextTab = this.activeTab() === "active" ? "history" : "active";
      this.activeTab.set(nextTab);
    } else {
      this.activeTab.set(tab);
    }
    this.selectedStatusFilter.set("");
    this.loadBookings();
  }

  toggleVehicleType(type: string): void {
    const current = this.selectedVehicleTypeFilter();
    if (current.includes(type)) {
      this.selectedVehicleTypeFilter.set(current.filter((t) => t !== type));
    } else {
      this.selectedVehicleTypeFilter.set([...current, type]);
    }

    // Auto-update selected vehicle IDs to match the updated type selection
    const availableIds = this.filteredVehiclesForPills().map((v) => v.id);
    this.selectedVehiclePlates.set(
      this.selectedVehiclePlates().filter((id) => availableIds.includes(id)),
    );
  }

  toggleVehiclePlate(vehicleId: string): void {
    const current = this.selectedVehiclePlates();
    if (current.includes(vehicleId)) {
      this.selectedVehiclePlates.set(current.filter((id) => id !== vehicleId));
    } else {
      this.selectedVehiclePlates.set([...current, vehicleId]);
    }
  }

  onDateSelected(date: Date): void {
    this.selectedDate.set(date);
    this.onFilterChange();
  }

  onMoreClicked(date: Date): void {
    this.selectedDailyDate.set(date);
    this.rightDrawerOpened.set(true);
  }

  closeDailyDrawer(): void {
    this.rightDrawerOpened.set(false);
    // Programmatically dispatch a click event to reset the calendar's internal state
    setTimeout(() => {
      document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }, 50);
  }

  getBookingEffectiveStatus(
    b: Booking,
  ): "CONFIRMED" | "COMPLETED" | "CANCELLED" {
    if (b.status === "CANCELLED") return "CANCELLED";
    if (b.status === "COMPLETED") return "COMPLETED";

    // Auto-complete: if CONFIRMED but past return time, treat as COMPLETED
    const returnTime = new Date((b.return || "").replace(" ", "T"));
    if (!isNaN(returnTime.getTime()) && returnTime < new Date()) {
      return "COMPLETED";
    }
    return "CONFIRMED";
  }

  toggleViewMode(): void {
    const nextMode = this.viewMode() === "calendar" ? "grid" : "calendar";
    this.viewMode.set(nextMode);
    this.onFilterChange();
  }

  setViewMode(mode: "calendar" | "grid" | "list"): void {
    if (this.isMobile() && mode === this.viewMode()) {
      const nextMode = this.viewMode() === "calendar" ? "grid" : "calendar";
      this.viewMode.set(nextMode);
    } else {
      this.viewMode.set(mode);
    }
    this.onFilterChange();
  }

  loadBookings(): void {
    const filters: any = {};

    if (this.activeTab() === "active") {
      filters.status = "booked";
    } else if (this.selectedStatusFilter()) {
      const statusFilter = this.selectedStatusFilter();
      if (statusFilter === "CONFIRMED") {
        filters.status = "booked";
      } else if (statusFilter === "CANCELLED") {
        filters.status = "cancel";
      }
      // Note: For 'COMPLETED', we don't pass status parameter so backend returns all,
      // and we filter locally on the frontend (since some CONFIRMED bookings are effectively completed).
    }

    if (this.selectedUserId()) {
      filters.user_id = Number(this.selectedUserId());
    }

    // Only send date filters to backend when manual date range (startDate/endDate) is set
    // and we are NOT in calendar view.
    // For quick month filter (selectedDate), we fetch all bookings and filter locally in
    // filteredBookings — same approach as Calendar view, ensuring consistent results.
    if (this.viewMode() !== "calendar" && this.startDate() && this.endDate()) {
      filters.depart_start = this.startDate().replace("T", " ") + ":00";
      filters.depart_end = this.endDate().replace("T", " ") + ":00";
    }

    this.bookingService.fetchBookings(filters).subscribe({
      error: (err) => console.error("Error fetching bookings:", err),
    });
  }

  onFilterChange(): void {
    this.loadBookings();
  }

  // Filter bookings locally by search query and vehicle type
  readonly filteredBookings = computed(() => {
    const list = this.bookingService.bookings();
    const query = this.searchQuery().toLowerCase().trim();
    const now = new Date();

    let result = list;

    // Filter by selectedStatusFilter locally
    if (this.selectedStatusFilter()) {
      const targetStatus = this.selectedStatusFilter();
      result = result.filter(
        (b) => this.getBookingEffectiveStatus(b) === targetStatus,
      );
    }

    // Filter by Custom Date Range or Quick Month
    const customStartStr = this.startDate();
    const customEndStr = this.endDate();
    const quickMonthVal = this.selectedDate();

    if (customStartStr || customEndStr) {
      const customStart = customStartStr
        ? new Date(customStartStr.replace(" ", "T")).getTime()
        : null;
      const customEnd = customEndStr
        ? new Date(customEndStr.replace(" ", "T")).getTime()
        : null;

      result = result.filter((b) => {
        if (!b.depart || !b.return) return false;
        const bookingStart = new Date(b.depart.replace(" ", "T")).getTime();
        const bookingEnd = new Date(b.return.replace(" ", "T")).getTime();

        // If both are provided, checking if they overlap with the range
        if (customStart !== null && customEnd !== null) {
          return bookingStart <= customEnd && bookingEnd >= customStart;
        }

        // If only start is provided, booking must not end before customStart
        if (customStart !== null) {
          return bookingEnd >= customStart;
        }

        // If only end is provided, booking must not start after customEnd
        if (customEnd !== null) {
          return bookingStart <= customEnd;
        }

        return true;
      });
    } else if (quickMonthVal) {
      const date = new Date(quickMonthVal);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const filterStart = new Date(year, month, 1, 0, 0, 0).getTime();
        const filterEnd = new Date(
          year,
          month + 1,
          0,
          23,
          59,
          59,
          999,
        ).getTime();

        result = result.filter((b) => {
          if (!b.depart || !b.return) return false;
          const bookingStart = new Date(b.depart.replace(" ", "T")).getTime();
          const bookingEnd = new Date(b.return.replace(" ", "T")).getTime();
          return bookingStart <= filterEnd && bookingEnd >= filterStart;
        });
      }
    }

    // Filter by activeTab:
    const active = this.activeTab() === "active";
    result = result.filter((b) => {
      const effStatus = this.getBookingEffectiveStatus(b);
      return active
        ? effStatus === "CONFIRMED"
        : effStatus === "COMPLETED" || effStatus === "CANCELLED";
    });

    // Filter by Search Query
    if (query) {
      result = result.filter((b) => {
        const dest = (b.destination || "").toLowerCase();
        const purp = (b.purpose || "").toLowerCase();
        const user = (b.userName || "").toLowerCase();
        const vehicleModel = b.vehicle
          ? (b.vehicle.model || "").toLowerCase()
          : "";
        const vehiclePlate = b.vehicle
          ? (b.vehicle.plateNumber || "").toLowerCase()
          : "";

        return (
          dest.includes(query) ||
          purp.includes(query) ||
          user.includes(query) ||
          vehicleModel.includes(query) ||
          vehiclePlate.includes(query)
        );
      });
    }

    // Filter by Quick Vehicle Type Filter
    if (this.selectedVehicleTypeFilter().length > 0) {
      const selectedTypes = this.selectedVehicleTypeFilter();
      result = result.filter((b) => {
        const type = b.vehicle?.vehicleTypeId || "Sedan";
        if (selectedTypes.includes("Sedan")) {
          if (
            type === "Sedan" ||
            !type ||
            (type !== "Pickup" &&
              type !== "Van" &&
              type !== "SUV" &&
              type !== "Other")
          ) {
            return true;
          }
        }
        return selectedTypes.includes(type);
      });
    }

    // Filter by Selected Vehicle License Plates (using unique vehicle IDs)
    if (this.selectedVehiclePlates().length > 0) {
      const selectedIds = this.selectedVehiclePlates();
      result = result.filter((b) => {
        const vehicleId = b.vehicle?.id;
        return vehicleId ? selectedIds.includes(vehicleId) : false;
      });
    }

    // Sort by Booking ID descending
    return [...result].sort((a, b) => Number(b.id) - Number(a.id));
  });

  resetFilters(): void {
    this.selectedUserId.set("");
    this.startDate.set("");
    this.endDate.set("");
    this.searchQuery.set("");
    this.selectedStatusFilter.set("");
    this.selectedVehicleTypeFilter.set([]);
    this.selectedVehiclePlates.set([]);
    this.selectedDate.set("");
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
    const isConfirmed = confirm(
      this.langService.translate(
        "Are you sure you want to cancel this booking?",
      ),
    );
    if (isConfirmed) {
      this.bookingService.cancelBooking(id).subscribe({
        next: () => {
          this.closeDetail();
          this.loadBookings();
        },
        error: (err: any) => {
          alert(
            this.langService.translate(
              err.error?.message ||
                "An error occurred while cancelling the booking. Please try again.",
            ),
          );
        },
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
        alert(
          this.langService.translate(
            err.error?.message ||
              "An error occurred while completing the booking. Please try again.",
          ),
        );
      },
    });
  }

  onEditBooking(booking: Booking | null): void {
    if (!booking) return;
    if (this.getBookingEffectiveStatus(booking) !== "CONFIRMED") {
      alert(
        this.langService.translate(
          "Only upcoming and ongoing bookings can be edited.",
        ),
      );
      return;
    }
    this.closeDetail();
    this.bookingDialogService.open(booking);
  }

  onDailyDrawerOpened(): void {
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 300);
  }
}
