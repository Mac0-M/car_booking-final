import { Component, inject, OnInit, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { AllSharedUi } from "../../../../shared/shared";
import { Booking } from "../../../../core/models/booking.model";
import { Vehicle } from "../../../../core/models/vehicle.model";
import { User } from "../../../../core/models/user.model";
import { UserService } from "../../../../core/services/user.service";
import { AvailabilityService } from "../../../../core/services/availability.service";
import { BookingService } from "../../../../core/services/booking.service";
import { AuthService } from "../../../../core/services/auth.service";
import { LanguageService } from "../../../../core/services/language.service";
import { ToastService } from "../../../../core/services/toast.service";

@Component({
  selector: "app-booking-edit-dialog",
  standalone: true,
  imports: [CommonModule, FormsModule, ...AllSharedUi],
  templateUrl: "./booking-edit-dialog.html",
  host: {
    class: "block w-full h-full",
  },
})
export class BookingEditDialogComponent implements OnInit {
  private readonly dialogRef = inject(DialogRef);
  private readonly bookingData = inject<Booking>(DIALOG_DATA);
  private readonly userService = inject(UserService);
  private readonly availabilityService = inject(AvailabilityService);
  private readonly bookingService = inject(BookingService);
  private readonly authService = inject(AuthService);
  private readonly langService = inject(LanguageService);
  private readonly toast = inject(ToastService);

  readonly booking = this.bookingData;

  // Form Fields
  depart = "";
  returnTime = "";
  destination = "";
  purpose = "";
  booked_for: number | null = null;
  vehicle_id: string | number | null = null;

  readonly usersList = signal<User[]>([]);
  readonly availableVehicles = signal<Vehicle[]>([]);
  readonly isLoadingVehicles = signal(false);
  readonly isSaving = signal(false);

  readonly filteredUsersList = computed(() => {
    const list = this.usersList();
    const currentUser = this.authService.currentUser();
    if (!currentUser) return list.filter((u) => u.role !== "Super_Admin");
    if (currentUser.role === "User") {
      return list.filter((u) => u.role !== "Admin" && u.role !== "Super_Admin");
    }
    return list.filter((u) => u.role !== "Super_Admin");
  });

  isMobile(): boolean {
    return window.innerWidth < 1024;
  }

  ngOnInit(): void {
    if (!this.booking) return;

    // Load initial values
    this.depart = this.booking.depart ? this.booking.depart.substring(0, 16) : "";
    this.returnTime = this.booking.return ? this.booking.return.substring(0, 16) : "";
    this.destination = this.booking.destination || "";
    this.purpose = this.booking.purpose || "";
    this.booked_for = this.booking.booked_for || null;
    this.vehicle_id = this.booking.vehicle ? Number(this.booking.vehicle.id) : null;

    // Load users list
    this.userService.findAll().subscribe({
      next: (users) => this.usersList.set(users),
      error: (err) => console.error("Error loading users:", err),
    });

    // Load vehicles based on initial dates
    this.onTimeChange();
  }

  onTimeChange(): void {
    if (!this.depart || !this.returnTime) return;
    const startMs = new Date(this.depart).getTime();
    const endMs = new Date(this.returnTime).getTime();
    if (endMs <= startMs) return;

    this.isLoadingVehicles.set(true);
    this.availabilityService.search(this.depart, this.returnTime, this.booking.id).subscribe({
      next: (vehicles) => {
        this.availableVehicles.set(vehicles);
        this.isLoadingVehicles.set(false);

        // Check if current vehicle is still available in the new list
        const isCurrentVehicleAvailable = vehicles.some(v => Number(v.id) === Number(this.vehicle_id));
        if (!isCurrentVehicleAvailable && vehicles.length > 0) {
          this.vehicle_id = Number(vehicles[0].id);
        } else if (vehicles.length === 0) {
          this.vehicle_id = null;
        }
      },
      error: () => {
        this.isLoadingVehicles.set(false);
      }
    });
  }

  get isReturnInPast(): boolean {
    if (!this.returnTime) return false;
    const endMs = new Date(this.returnTime).getTime();
    const nowMs = Date.now();

    // Check if it differs from initial booking return time
    const initialReturnStr = this.booking.return ? this.booking.return.substring(0, 16).replace(" ", "T") : "";
    const currentReturnStr = this.returnTime.replace(" ", "T");
    if (currentReturnStr === initialReturnStr) {
      return false;
    }

    return endMs < nowMs - 5 * 60 * 1000;
  }

  get isReturnInvalid(): boolean {
    if (!this.depart || !this.returnTime) return false;
    const startMs = new Date(this.depart).getTime();
    const endMs = new Date(this.returnTime).getTime();
    return endMs <= startMs;
  }

  get isFormValid(): boolean {
    if (!this.depart || !this.returnTime || !this.vehicle_id || !this.booked_for) {
      return false;
    }
    return !this.isReturnInPast && !this.isReturnInvalid;
  }

  onSubmit(): void {
    if (!this.isFormValid || this.isSaving()) return;

    this.isSaving.set(true);

    const payload = {
      vehicle_id: Number(this.vehicle_id),
      destination: this.destination || undefined,
      purpose: this.purpose || undefined,
      depart: this.depart.replace("T", " ") + ":00",
      return: this.returnTime.replace("T", " ") + ":00",
      booked_for: this.booked_for ? Number(this.booked_for) : undefined,
    };

    this.bookingService.updateBooking(this.booking.id, payload).subscribe({
      next: () => {
        this.toast.success(this.langService.translate('Booking updated successfully.'));
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toast.error(
          this.langService.translate(
            err.error?.message || "An error occurred while updating the booking. Please try again."
          )
        );
      },
    });
  }

  onClose(): void {
    this.dialogRef.close(false);
  }
}
