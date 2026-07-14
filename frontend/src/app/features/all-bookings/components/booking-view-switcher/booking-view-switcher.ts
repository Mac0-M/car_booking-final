import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AllSharedUi } from "../../../../shared/shared";

@Component({
  selector: "app-booking-view-switcher",
  standalone: true,
  imports: [CommonModule, ...AllSharedUi],
  templateUrl: "./booking-view-switcher.html",
})
export class BookingViewSwitcher {
  @Input() viewMode: "calendar" | "grid" | "list" = "calendar";
  @Input() isMobile = false;

  @Output() viewModeChange = new EventEmitter<"calendar" | "grid" | "list">();

  setViewMode(mode: "calendar" | "grid" | "list"): void {
    this.viewModeChange.emit(mode);
  }

  toggle(): void {
    const nextMode = this.viewMode === "calendar" ? "grid" : "calendar";
    this.viewModeChange.emit(nextMode);
  }
}
