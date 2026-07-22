import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ComponentBadge } from "../badge/badge";
import { TranslateFixed } from "../translate-fixed/translate-fixed";

@Component({
  selector: "component-mobile-card",
  standalone: true,
  imports: [CommonModule, ComponentBadge, TranslateFixed],
  templateUrl: "./mobile-card.html",
  host: {
    class: "block p-4 space-y-3",
  },
})
export class ComponentMobileCard {
  @Input() showImage = true;
  @Input() imageUrl = "";
  @Input() title = "";
  @Input() subtitle = "";
  @Input() fallbackIcon = "directions_car";
  @Input() imageShape: "circle" | "square" = "square";
  @Input() imageFit: "contain" | "cover" | "fill" = "cover";
  @Input() badgeVariant?: "available" | "pending" | "booked" | "unavailable";
  @Input() badgeLabelKey?: string;
  @Input() badgeSize: "xs" | "sm" | "base" = "xs";
}
