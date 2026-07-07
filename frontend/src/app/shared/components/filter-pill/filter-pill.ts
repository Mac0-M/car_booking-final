import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'button[component-filter-pill]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="w-1.5 h-1.5 rounded-full shrink-0" [ngClass]="dotColor"></span>
    <span class="leading-none font-sans">{{ label }}</span>
  `,
  host: {
    '[class]': 'hostClasses',
    '[class.ring-2]': 'active',
    '[class.ring-offset-2]': 'active'
  }
})
export class ComponentFilterPill {
  @Input() label = '';
  @Input() active = false;
  @Input() dotColor = 'bg-gray-400';
  @Input() ringClass = 'ring-gray-400';
  @Input() size: 'sm' | 'md' = 'sm';

  @Output() click = new EventEmitter<void>();

  get hostClasses(): string {
    const base = 'inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-700 cursor-pointer select-none transition-all active:scale-95 duration-100';
    const padding = this.size === 'sm' ? 'px-2 py-1' : 'px-2.5 py-1.5';
    const activeRing = this.active ? this.ringClass : '';
    return `${base} ${padding} ${activeRing}`;
  }
}
