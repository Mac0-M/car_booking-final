import { Component, ContentChild, Input, TemplateRef } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "component-views",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./views.html",
  host: {
    class: "flex-1 min-h-0 w-full flex flex-col overflow-hidden",
  },
})
export class ComponentViews {
  @Input() viewMode: "calendar" | "grid" | "list" = "grid";
  @Input() hasItems = false;
  @Input() isMobile = false;
  @Input() gridClass = "";

  @ContentChild("emptyView") emptyViewTpl!: TemplateRef<any>;
}
