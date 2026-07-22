import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateFixed } from "../translate-fixed/translate-fixed";
import { ComponentButton } from "../button/button";

@Component({
  selector: "component-filter-sidebar",
  standalone: true,
  imports: [CommonModule, TranslateFixed, ComponentButton],
  templateUrl: "./filter-sidebar.html",
  host: {
    class: "h-full flex flex-col bg-white w-88 max-w-full",
  },
})
export class ComponentFilterSidebar {
  @Input() showHeader = false;
  @Input() titleKey = "Search & Filters / ค้นหาและกรอง";

  @Output() reset = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
}
