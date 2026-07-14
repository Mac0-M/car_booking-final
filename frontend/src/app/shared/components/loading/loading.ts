import { Component, Input } from "@angular/core";
import { NgClass } from "@angular/common";

@Component({
  selector: "component-loading",
  standalone: true,
  imports: [NgClass],
  templateUrl: "./loading.html",
})
export class ComponentLoading {
  @Input() message: string = "";
  @Input() variant: "default" | "overlay" = "default";
  @Input() size: "xs" | "sm" | "base" = "base";

  protected readonly containerClasses = {
    default: "flex flex-col items-center justify-center p-6 w-full",
    overlay:
      "fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/40 backdrop-blur-xs",
  };

  protected readonly spinnerSizeClasses = {
    xs: "w-6 h-6 border-2",
    sm: "w-12 h-12 border-3",
    base: "w-16 h-16 border-4",
  };

  protected readonly textSizeClasses = {
    xs: "text-xs mt-2",
    sm: "text-sm mt-3",
    base: "text-base mt-4",
  };
}
