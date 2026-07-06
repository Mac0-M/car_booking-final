import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'component-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './button.html',
  host: {
    class: 'inline-block'
  }
})
export class ComponentButton {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'submit' | 'cancel' = 'submit';
  @Input() size: 'sm' | 'lg' | 'xxl' = 'xxl';
  @Input() disabled: boolean = false;

  protected readonly baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200  active:scale-95 w-full';

  protected readonly variantClasses = {
    submit: 'bg-gray-700 text-white shadow-md shadow-gray-700',
    cancel: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50'
  };

  protected readonly sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-lg',
    xxl: 'px-8 py-3.5 text-2xl'
  };
}