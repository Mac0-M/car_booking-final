import { Component, Input } from "@angular/core";
import { NgClass } from "@angular/common";

@Component({
  selector: "component-button",
  standalone: true,
  imports: [NgClass],
  templateUrl: "./button.html",
  host: {
    class: "inline-block",
  },
})
export class ComponentButton {
  @Input() type: "button" | "submit" | "reset" = "button";
  @Input() variant:
    | "submit"
    | "cancel"
    | "secondary"
    | "danger-outline"
    | "success-outline"
    | "danger"
    | "plain"
    | "danger-text" = "submit";
  @Input() size: "xs" | "sm" | "md" | "lg" | "xxl" = "xxl";
  @Input() disabled: boolean = false;

  protected readonly baseClasses =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 active:scale-95 w-full cursor-pointer select-none";

  protected readonly variantClasses = {
    submit: "bg-gray-700 text-white shadow-md shadow-gray-700/30 border-0",
    cancel:
      "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-200",
    secondary:
      "border border-gray-200 bg-white text-gray-600 hover:bg-gray-200",
    "danger-outline":
      "border border-red-200 bg-white text-red-600 hover:bg-red-100",
    "success-outline":
      "border border-green-200 bg-white text-green-600 hover:bg-green-100",
    danger:
      "bg-red-500 text-white shadow-md shadow-red-500/20 hover:bg-red-650 border-0",
    plain: "border-0 bg-transparent text-gray-400 hover:text-gray-600",
    "danger-text": "border-0 bg-transparent text-red-500 hover:bg-red-100",
  };

  protected readonly sizeClasses = {
    xs: "px-3 py-1.5 text-xs",
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-2.5 text-lg",
    xxl: "px-8 py-3.5 text-2xl",
  };
}
