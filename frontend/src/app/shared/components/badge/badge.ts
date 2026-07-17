import { Component, Input } from "@angular/core";
import { NgClass } from "@angular/common";
import { TranslateFixed } from "../translate-fixed/translate-fixed";

@Component({
  selector: "component-badge",
  standalone: true,
  imports: [NgClass, TranslateFixed],
  templateUrl: "./badge.html",
  host: {
    class: "inline-flex",
  },
  styles: [
    `
      :host ::ng-deep translate-fixed .translate-fixed-wrapper {
        justify-items: center !important;
      }
    `,
  ],
})
export class ComponentBadge {
  @Input() variant: "available" | "booked" | "unavailable" | "pending" =
    "available";
  @Input() size: "xs" | "sm" | "base" = "sm";

  protected readonly baseClasses =
    "inline-flex items-center justify-center font-medium rounded-3xl transition-all duration-200 border-2 border-solid text-center";

  protected readonly variantClasses = {
    available: "bg-green-200 text-green-800 border-green-300",
    booked: "bg-sand-200 text-sand-400 border-sand-300",
    unavailable: "bg-red-200 text-red-800 border-red-300",
    pending: "bg-yellow-200 text-yellow-800 border-yellow-300",
  };

  protected readonly sizeClasses = {
    xs: "px-2 py-0.5 text-xs min-w-[70px]",
    sm: "px-3 py-1 text-sm min-w-[80px]",
    base: "px-4 py-1.5 text-base min-w-[95px]",
  };
}
