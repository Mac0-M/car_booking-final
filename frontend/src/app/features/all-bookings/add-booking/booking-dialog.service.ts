import { Injectable, inject } from "@angular/core";
import { Dialog } from "@angular/cdk/dialog";
import { BookingDialogComponent } from "./booking-dialog";
import { BookingEditDialogComponent } from "../components/booking-edit-dialog/booking-edit-dialog";
import { Booking } from "../../../core/models/booking.model";

@Injectable({
  providedIn: "root",
})
export class BookingDialogService {
  private readonly dialog = inject(Dialog);

  open(bookingToEdit?: Booking): void {
    const component = bookingToEdit ? BookingEditDialogComponent : BookingDialogComponent;
    const config: any = {
      width: "672px",
      maxWidth: "95vw",
      maxHeight: "95vh",
      backdropClass: [
        "bg-sand-900/60",
        "backdrop-blur-sm",
        "animate-backdrop-fade",
      ],
      panelClass: [
        "w-full",
        "max-w-2xl",
        "shadow-xl",
        "rounded-2xl",
        "overflow-hidden",
        "animate-modal-zoom",
      ],
    };

    if (bookingToEdit) {
      config.data = bookingToEdit;
    }

    this.dialog.open(component as any, config);
  }
}
