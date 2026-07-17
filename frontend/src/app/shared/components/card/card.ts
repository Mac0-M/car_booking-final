import { Component, Input } from "@angular/core";
import { NgClass } from "@angular/common";

@Component({
  selector: "component-card",
  standalone: true,
  imports: [NgClass],
  templateUrl: "./card.html",
  host: {
    class: "block w-full",
  },
})
export class ComponentCard {
  @Input() variant: "default" | "flat" | "outline" = "default";
  @Input() size: "sm" | "base" | "lg" = "base";
  @Input() rounded:
    | "none"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "full" = "2xl";

  protected readonly baseClasses =
    "block w-full border border-solid transition-all duration-200";

  protected readonly variantClasses = {
    default: "bg-white border-sand-200 shadow-sm shadow-sand-200/30",
    flat: "bg-container-low border-container",
    outline: "bg-transparent border-sand-300",
  };

  protected readonly sizeClasses = {
    sm: "p-3 sm:p-4 text-xs sm:text-sm",
    base: "p-4 sm:p-5 md:p-6 text-sm sm:text-base",
    lg: "p-5 sm:p-6 md:p-8 text-base sm:text-lg",
  };
}
