import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Vehicle } from "../../../../core/models/vehicle.model";
import { AllSharedUi } from "../../../../shared/shared";
import { VehicleCardComponent } from "../../add-booking/pages/vehicle-selection/components/vehicle-card/vehicle-card";

@Component({
  selector: "app-booking-details",
  standalone: true,
  imports: [CommonModule, ...AllSharedUi, VehicleCardComponent],
  templateUrl: "./booking-details.html",
})
export class BookingDetailsComponent {
  @Input() bookingDate = "";
  @Input() startTime = "";
  @Input() endTime = "";
  @Input() destination = "";
  @Input() purpose = "";
  @Input() userName = "";
  @Input() userPhone = "";
  @Input() vehicle: Vehicle | null = null;
  @Input() depart = "";
  @Input() returnTime = "";
  @Input() bookedByUser: any = null;
  @Input() bookedForUser: any = null;

  get totalDuration(): string {
    const startStr = this.depart || "";
    const endStr = this.returnTime || "";

    if (startStr && endStr) {
      const cleanStart = startStr.replace(" ", "T");
      const cleanEnd = endStr.replace(" ", "T");
      const diffMs =
        new Date(cleanEnd).getTime() - new Date(cleanStart).getTime();
      if (diffMs <= 0) return "";

      const diffMinutes = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;

      const parts: string[] = [];
      if (hours > 0) {
        parts.push(`${hours} hr${hours > 1 ? "s" : ""}`);
      }
      if (minutes > 0) {
        parts.push(`${minutes} min${minutes > 1 ? "s" : ""}`);
      }
      return parts.length > 0 ? parts.join(" ") : "0 mins";
    }

    if (!this.startTime || !this.endTime) return "";

    const [startH, startM] = this.startTime.split(":").map(Number);
    const [endH, endM] = this.endTime.split(":").map(Number);

    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return "";

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const diffMinutes = endMinutes - startMinutes;
    if (diffMinutes <= 0) return "";

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    const parts: string[] = [];
    if (hours > 0) {
      parts.push(`${hours} hr${hours > 1 ? "s" : ""}`);
    }
    if (minutes > 0) {
      parts.push(`${minutes} min${minutes > 1 ? "s" : ""}`);
    }

    return parts.length > 0 ? parts.join(" ") : "0 mins";
  }
}
