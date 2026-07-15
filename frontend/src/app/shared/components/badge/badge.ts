import { Component, Input } from "@angular/core";
import { NgClass } from "@angular/common";
import { TranslatePipe } from "../../pipes/translate.pipe";

@Component({
  selector: "component-badge",
  standalone: true,
  imports: [NgClass, TranslatePipe],
  templateUrl: "./badge.html",
  host: {
    class: "inline-flex",
  },
})
export class ComponentBadge {
  @Input() variant: "available" | "booked" | "unavailable" | "pending" =
    "available";
  @Input() size: "xs" | "sm" | "base" = "sm";

  protected readonly baseClasses =
    "inline-flex items-center justify-center font-medium rounded-3xl transition-all duration-200 border-2 border-solid  ";

  protected readonly variantClasses = {
    available: "bg-green-200 text-green-800 border-green-300",
    booked: "bg-gray-200 text-gray-400 border-gray-300",
    unavailable: "bg-red-200 text-red-800 border-red-300",
    pending: "bg-yellow-200 text-yellow-800 border-yellow-300",
  };

  protected readonly sizeClasses = {
    xs: "px-2 py-0.5 text-xs",
    sm: "px-3 py-1 text-sm",
    base: "px-4 py-1.5 text-base",
  };
}
