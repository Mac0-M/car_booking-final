import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'component-empty-state',
  standalone: true,
  imports: [NgClass],
  templateUrl: './empty-state.html',
})
export class ComponentEmptyState {
  @Input() title: string = 'No Data Found';
  @Input() description: string = 'Could not find the information you are looking for.';
  @Input() icon: 'search' | 'calendar' | 'inbox' | 'error' = 'inbox';
  @Input() variant: 'default' | 'card' = 'default';

  @Output() actionClick = new EventEmitter<void>(); 

  protected readonly baseClasses = 'flex flex-col items-center justify-center text-center rounded-2xl w-full';

  protected readonly variantClasses = {
    default: 'bg-transparent py-10 px-4',
    card: 'bg-white border border-gray-200 shadow-sm p-8 md:p-12'
  };

  protected readonly iconMap = {
    search: 'search',
    calendar: 'calendar_today',
    inbox: 'inbox',
    error: 'error_outline'
  };

  onActionClick() {
    this.actionClick.emit();
  }
}
