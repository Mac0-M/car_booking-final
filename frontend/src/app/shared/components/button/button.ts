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
    | "success"
    | "danger"
    | "plain"
    | "danger-text" = "submit";
  @Input() size: "xs" | "sm" | "md" | "lg" | "xxl" = "xxl";
  @Input() disabled: boolean = false;

  protected readonly baseClasses =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 active:scale-95 w-full cursor-pointer select-none";

  protected readonly variantClasses = {
    submit:
      "btn-purple-theme bg-primary text-white shadow-md shadow-primary/30 border border-transparent hover:bg-primary-hover",
    cancel:
      "border border-primary bg-transparent text-primary hover:bg-primary-container hover:text-primary-hover hover:border-primary-hover",
    secondary:
      "border border-gray-200 bg-white text-gray-600 hover:bg-surface-dim hover:text-gray-800 hover:border-surface-dim",
    "danger-outline":
      "border border-red-200 bg-white text-red-600 hover:bg-red-100",
    "success-outline":
      "border border-green-200 bg-white text-green-600 hover:bg-green-100",
    success:
      "bg-green-500 text-white shadow-md shadow-green-500/20 hover:bg-green-650 border border-transparent",
    danger:
      "bg-red-500 text-white shadow-md shadow-red-500/20 hover:bg-red-650 border border-transparent",
    plain: "border border-transparent bg-transparent text-gray-400 hover:text-gray-600",
    "danger-text": "border border-transparent bg-transparent text-red-500 hover:bg-red-100",
  };

  protected readonly sizeClasses = {
    xs: "px-3 py-1.5 text-xs",
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-2.5 text-lg",
    xxl: "px-8 py-3.5 text-2xl",
  };
}
