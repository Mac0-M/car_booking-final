import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  OnChanges,
  SimpleChanges,
  ViewChild,
  TemplateRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Vehicle } from "../../../../core/models/vehicle.model";
import { AllSharedUi } from "../../../../shared/shared";
import { AuthService } from "../../../../core/services/auth.service";
import { DialogModule, Dialog, DialogRef } from "@angular/cdk/dialog";
import { BookingDetailsComponent } from "../booking-details/booking-details";

@Component({
  selector: "app-booking-detail-modal",
  standalone: true,
  imports: [
    CommonModule,
    ...AllSharedUi,
    DialogModule,
    BookingDetailsComponent,
  ],
  templateUrl: "./booking-detail-modal.html",
})
export class BookingDetailModal implements OnChanges {
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(Dialog);

  @ViewChild("dialogTemplate") dialogTemplate!: TemplateRef<any>;
  private dialogRef: DialogRef<any> | null = null;

  @Input() bookingDate = "";
  @Input() startTime = "";
  @Input() endTime = "";
  @Input() destination = "";
  @Input() purpose = "";
  @Input() userName = "";
  @Input() userPhone = "";
  @Input() vehicle: Vehicle | null = null;
  @Input() status: "CONFIRMED" | "CANCELLED" | "COMPLETED" = "CONFIRMED";

  @Input() depart = "";
  @Input() returnTime = "";
  @Input() bookedByUser: any = null;
  @Input() bookedForUser: any = null;

  // Modal Configuration
  @Input() title = "";
  @Input() description = "";
  @Input() isModal = false;
  @Input() hideHeader = false;
  @Input() isOpen = false;

  @Output() close = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() complete = new EventEmitter<number>();

  readonly showMileInput = signal(false);
  readonly mileDistanceValue = signal<string>("");

  get isAdmin(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === "Admin" || role === "Super_Admin";
  }

  get canManage(): boolean {
    if (this.isAdmin) return true;
    const currentUserId =
      this.authService.currentUser()?.userId ||
      this.authService.currentUser()?.user_id;
    if (!currentUserId) return false;
    return (
      this.bookedByUser?.user_id === currentUserId ||
      this.bookedForUser?.user_id === currentUserId
    );
  }

  onCompleteClick(): void {
    this.showMileInput.set(true);
  }

  confirmComplete(): void {
    const rawVal = this.mileDistanceValue().trim();
    if (rawVal === "") {
      this.complete.emit(0);
      this.showMileInput.set(false);
      this.mileDistanceValue.set("");
      return;
    }
    const val = Number(rawVal);
    if (isNaN(val) || val < 0) {
      alert("Please enter a distance value greater than or equal to 0.");
      return;
    }
    this.complete.emit(val);
    this.showMileInput.set(false);
    this.mileDistanceValue.set("");
  }

  cancelComplete(): void {
    this.showMileInput.set(false);
    this.mileDistanceValue.set("");
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isOpen"] && this.isModal) {
      if (this.isOpen) {
        // Wait a tick to ensure view query (dialogTemplate) is fully resolved
        setTimeout(() => this.openDialog(), 0);
      } else {
        this.closeDialog();
      }
    }
  }

  get isMobile(): boolean {
    return window.innerWidth < 1024;
  }

  private openDialog(): void {
    if (this.dialogRef || !this.dialogTemplate) return;
    const isMobile = this.isMobile;
    this.dialogRef = this.dialog.open(this.dialogTemplate, {
      width: isMobile ? "100vw" : "672px",
      maxWidth: isMobile ? "100vw" : "95vw",
      maxHeight: isMobile ? "100dvh" : "90dvh",
      backdropClass: [
        "bg-gray-900/60",
        "backdrop-blur-sm",
        "animate-backdrop-fade",
      ],
      panelClass: [
        "w-full",
        isMobile ? "max-w-full" : "max-w-2xl",
        isMobile ? "max-h-[100dvh]" : "max-h-[90dvh]",
        isMobile ? "h-[100dvh]" : "",
        "flex",
        "flex-col",
        "shadow-xl",
        isMobile ? "rounded-none" : "rounded-2xl",
        "overflow-hidden",
        "animate-modal-zoom",
      ].filter(Boolean),
    });

    this.dialogRef.closed.subscribe(() => {
      this.closeDialog();
      this.close.emit();
    });
  }

  private closeDialog(): void {
    if (this.dialogRef) {
      const ref = this.dialogRef;
      this.dialogRef = null;
      ref.close();
    }
  }
}
