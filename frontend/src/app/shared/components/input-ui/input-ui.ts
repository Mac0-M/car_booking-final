import { Component, Input, forwardRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'component-input-ui',
  standalone: true,
  imports: [NgClass],
  templateUrl: './input-ui.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComponentInputUi),
      multi: true
    }
  ]
})
export class ComponentInputUi implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: 'text' | 'number' | 'email' | 'tel' | 'password' | 'date' | 'time' | 'datetime-local' = 'text';
  @Input() id: string = '';
  @Input() error: string | boolean | null = '';
  @Input() disabled: boolean = false;
  @Input() icon: string = '';
  @Input() size: 'sm' | 'base' | 'lg' = 'base';
  @Input() min: string = '';
  @Input() max: string = '';

  get hasError(): boolean {
    return !!this.error;
  }

  get errorMessage(): string {
    return typeof this.error === 'string' ? this.error : '';
  }

  value: any = '';
  private uniqueId = 'input-' + Math.random().toString(36).substring(2, 9);

  get inputId(): string {
    return this.id || this.uniqueId;
  }

  // ControlValueAccessor implementation
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let val = inputElement.value;

    if (this.type === 'number') {
      val = val.replace(/\D/g, '');
      inputElement.value = val;
    } else if (this.type === 'tel') {
      val = val.replace(/\D/g, '');
      val = val.slice(0, 10);
      inputElement.value = val;
    }

    this.value = val;
    this.onChange(val);
  }

  onBlur() {
    this.onTouched();
  }

  protected readonly baseClasses = 'w-full rounded-xl border border-solid transition-all duration-200 focus:outline-none focus:ring-4 outline-none text-gray-800 bg-white placeholder-gray-400';

  protected readonly sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    base: 'px-4 py-2.5 text-base',
    lg: 'px-5 py-3.5 text-lg'
  };

  protected readonly stateClasses = {
    normal: 'border-gray-200 focus:border-gray-700 focus:ring-gray-100',
    error: 'border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/10',
    disabled: 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
  };
}
