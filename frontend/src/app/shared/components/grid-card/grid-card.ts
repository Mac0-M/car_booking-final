import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ComponentCard } from "../card/card";
import { ComponentBadge } from "../badge/badge";
import { TranslateFixed } from "../translate-fixed/translate-fixed";

@Component({
  selector: "component-grid-card",
  standalone: true,
  imports: [CommonModule, ComponentCard, ComponentBadge, TranslateFixed],
  templateUrl: "./grid-card.html",
  host: {
    class: "h-full block",
  },
})
export class ComponentGridCard {
  @Input() imageUrl = "";
  @Input() modelName = "";
  @Input() badgeVariant: "available" | "pending" | "booked" | "unavailable" =
    "available";
  @Input() badgeLabelKey = "";
  @Input() badgeSize: "xs" | "sm" | "base" = "xs";
  @Input() cursorPointer = false;
  @Input() fallbackIcon = "directions_car";
  @Input() imageFit: "contain" | "cover" | "fill" = "contain";
}
