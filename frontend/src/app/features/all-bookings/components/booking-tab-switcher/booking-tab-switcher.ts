import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AllSharedUi } from "../../../../shared/shared";

@Component({
  selector: "app-booking-tab-switcher",
  standalone: true,
  imports: [CommonModule, ...AllSharedUi],
  templateUrl: "./booking-tab-switcher.html",
})
export class BookingTabSwitcher {
  @Input() activeTab: "active" | "history" = "active";
  @Output() activeTabChange = new EventEmitter<"active" | "history">();

  toggleActiveTab(): void {
    const nextTab = this.activeTab === "active" ? "history" : "active";
    this.activeTabChange.emit(nextTab);
  }
}
