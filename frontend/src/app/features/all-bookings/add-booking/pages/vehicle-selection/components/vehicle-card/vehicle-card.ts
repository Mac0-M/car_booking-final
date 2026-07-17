import { Component, Input, Output, EventEmitter } from "@angular/core";
import { TitleCasePipe } from "@angular/common";
import { Vehicle } from "../../../../../../../core/models/vehicle.model";
import { AllSharedUi } from "../../../../../../../shared/shared";
import { environment } from "../../../../../../../../environments/environment";

/**
 * VehicleCardComponent: การ์ดแสดงข้อมูลรถยนต์ที่ให้เลือก
 * - ใช้ shared component-card เป็น wrapper
 * - ใช้ shared component-badge แสดงสถานะ
 * - ใช้ shared component-button สำหรับปุ่มเลือก
 */
@Component({
  selector: "app-vehicle-card",
  standalone: true,
  imports: [
    AllSharedUi,
    TitleCasePipe,
  ],
  templateUrl: "./vehicle-card.html",
})
export class VehicleCardComponent {
  @Input({ required: true }) vehicle!: Vehicle;
  @Input() isAvailable = true;
  @Input() readonly = false;
  @Input() type: "full" | "mini" = "full";
  @Input() rounded: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full" = "2xl";
  @Output() selectVehicle = new EventEmitter<Vehicle>();

  get vehicleImgUrl(): string {
    if (!this.vehicle || !this.vehicle.vehicleImg) {
      return "";
    }
    if (
      this.vehicle.vehicleImg.startsWith("http") ||
      this.vehicle.vehicleImg.startsWith("blob:")
    ) {
      return this.vehicle.vehicleImg;
    }
    const baseUrl = environment.apiUrl.replace("/api/v1", "");
    const imgPath = this.vehicle.vehicleImg.startsWith("/")
      ? this.vehicle.vehicleImg
      : `/${this.vehicle.vehicleImg}`;
    return `${baseUrl}${imgPath}`;
  }

  get isDisabled(): boolean {
    return !this.isAvailable;
  }

  get statusVariant(): "available" | "booked" | "unavailable" {
    if (this.vehicle.vehicleState) {
      return this.vehicle.vehicleState;
    }
    const status = (this.vehicle.status || "").toLowerCase();
    if (
      status === "available" ||
      status === "booked" ||
      status === "unavailable"
    ) {
      return status;
    }
    return "unavailable";
  }

  /** Overlay tint classes per status */
  get overlayClasses(): string {
    const map: Record<string, string> = {
      available: "",
      booked: "bg-sand-100/60",
      unavailable: "bg-red-50/60",
    };
    return map[this.statusVariant] ?? "";
  }

  onSelect(): void {
    if (!this.isDisabled) {
      this.selectVehicle.emit(this.vehicle);
    }
  }
}
