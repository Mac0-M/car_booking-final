import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'component-card',
  standalone: true,
  imports: [NgClass],
  templateUrl: './card.html',
})
export class ComponentCard {
  @Input() variant: 'default' | 'flat' | 'outline' = 'default';
  @Input() size: 'sm' | 'base' | 'lg' = 'base';

  protected readonly baseClasses = 'block w-full rounded-2xl border border-solid transition-all duration-200';

  protected readonly variantClasses = {
    default: 'bg-white border-gray-200 shadow-sm',
    flat: 'bg-gray-50 border-gray-100',
    outline: 'bg-transparent border-gray-300'
  };

  protected readonly sizeClasses = {
    sm: 'p-3 sm:p-4 text-xs sm:text-sm',
    base: 'p-4 sm:p-5 md:p-6 text-sm sm:text-base',
    lg: 'p-5 sm:p-6 md:p-8 text-base sm:text-lg'
  };
}
