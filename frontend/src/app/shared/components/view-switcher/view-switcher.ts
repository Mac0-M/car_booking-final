import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateFixed } from "../translate-fixed/translate-fixed";
import { TranslatePipe } from "../../pipes/translate.pipe";

@Component({
  selector: "component-view-switcher",
  standalone: true,
  imports: [CommonModule, TranslateFixed, TranslatePipe],
  templateUrl: "./view-switcher.html",
})
export class ComponentViewSwitcher {
  @Input() viewMode: "calendar" | "grid" | "list" = "grid";
  @Input() isMobile = false;
  @Input() modes: ("calendar" | "grid" | "list")[] = ["calendar", "grid", "list"];

  @Output() viewModeChange = new EventEmitter<"calendar" | "grid" | "list">();

  setViewMode(mode: "calendar" | "grid" | "list"): void {
    this.viewModeChange.emit(mode);
  }

  toggle(): void {
    if (this.modes.length === 2 && this.modes.includes("grid") && this.modes.includes("list")) {
      const nextMode = this.viewMode === "grid" ? "list" : "grid";
      this.viewModeChange.emit(nextMode);
    } else {
      const nextMode = this.viewMode === "calendar" ? "grid" : "calendar";
      this.viewModeChange.emit(nextMode);
    }
  }

  getSlidingTransform(): string {
    if (this.modes.length === 3) {
      return this.viewMode === "calendar"
        ? "translateX(0)"
        : this.viewMode === "grid"
        ? "translateX(calc(100% + 2px))"
        : "translateX(calc(200% + 4px))";
    } else {
      // 2 modes: grid and list
      return this.viewMode === "grid"
        ? "translateX(0)"
        : "translateX(calc(100% + 2px))";
    }
  }
}
