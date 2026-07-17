import { Component, Output, EventEmitter } from "@angular/core";
import { AllSharedUi } from "../../../../../../../shared/shared";

/**
 * NoVehicleAvailableComponent: แสดงผลเมื่อไม่พบรถยนต์ว่างในช่วงเวลาและเงื่อนไขที่เลือก
 */
@Component({
  selector: "app-no-vehicle-available",
  standalone: true,
  imports: [AllSharedUi],
  templateUrl: "./no-vehicle-available.html",
})
export class NoVehicleAvailableComponent {
  @Output() goBack = new EventEmitter<void>();

  onGoBack(): void {
    this.goBack.emit();
  }
}
