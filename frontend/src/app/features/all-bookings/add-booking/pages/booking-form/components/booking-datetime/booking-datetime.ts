import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { AllSharedUi } from '../../../../../../../shared/shared';

export interface BookingDateTimeValue {
  date: string;
  startTime: string;
  endTime: string;
}

/**
 * BookingTimeComponent: Departure and return date & time selection component.
 * - Uses native HTML5 controls for clean layout and responsiveness.
 * - Prevents selecting past times if travel date is today.
 */
@Component({
  selector: 'featurecomp-booking-time',
  standalone: true,
  imports: [CommonModule, FormsModule,AllSharedUi],
  templateUrl: './booking-datetime.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BookingTimeComponent),
      multi: true
    }
  ]
})
export class BookingTimeComponent implements ControlValueAccessor, OnInit {
  @Input() label = 'Select Travel Date and Time';

  value: BookingDateTimeValue = { date: '', startTime: '', endTime: '' };
  disabled = false;
  todayDateStr = '';

  onChange = (val: BookingDateTimeValue) => {};
  onTouched = () => {};

  ngOnInit(): void {
    const today = new Date(); 
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.todayDateStr = `${yyyy}-${mm}-${dd}`;

    const hh = String(today.getHours()).padStart(2, '0');
    const min = String(today.getMinutes()).padStart(2, '0');
    const currentStart = `${hh}:${min}`;

    let eh = today.getHours() + 2;
    if (eh >= 24) eh = 23;
    const currentEnd = `${eh.toString().padStart(2, '0')}:${min}`;

    if (!this.value.date) {
      this.value.date = this.todayDateStr;
    }
    if (!this.value.startTime) {
      this.value.startTime = currentStart;
    }
    if (!this.value.endTime) {
      this.value.endTime = currentEnd;
    }
  }

  onModelChange(field: keyof BookingDateTimeValue, targetVal: string): void {
    const newValue = { ...this.value, [field]: targetVal };
    
    // If date is changed to today, auto-adjust start time and end time if start time is in the past
    if (field === 'date' && targetVal === this.todayDateStr) {
      if (this.isPastTimeValue(newValue.startTime)) {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        newValue.startTime = `${hh}:${min}`;
        
        let eh = now.getHours() + 2;
        if (eh >= 24) eh = 23;
        newValue.endTime = `${eh.toString().padStart(2, '0')}:${min}`;
      }
    }

    // Automatically adjust end time if start time is later or equal, or if end time is empty
    if (field === 'startTime' && targetVal) {
      if (!newValue.endTime || this.isTimeBeforeOrEqual(newValue.endTime, targetVal)) {
        const [sh, sm] = targetVal.split(':').map(Number);
        let eh = sh + 2;
        if (eh >= 24) eh = 23;
        newValue.endTime = `${eh.toString().padStart(2, '0')}:${sm.toString().padStart(2, '0')}`;
      }
    }

    this.value = newValue;
    this.onChange(newValue);
    this.onTouched();
  }

  private isPastTimeValue(timeStr: string): boolean {
    if (!timeStr) return true;
    const now = new Date();
    const [sh, sm] = timeStr.split(':').map(Number);
    return sh < now.getHours() || (sh === now.getHours() && sm < now.getMinutes());
  }


  get minStartTime(): string {
    if (this.value.date !== this.todayDateStr) return '';
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${min}`;
  }

  get isPastTime(): boolean {
    if (this.value.date !== this.todayDateStr || !this.value.startTime) return false;
    const now = new Date();
    const [sh, sm] = this.value.startTime.split(':').map(Number);
    return sh < now.getHours() || (sh === now.getHours() && sm < now.getMinutes());
  }

  get isValidRange(): boolean {
    if (!this.value.startTime || !this.value.endTime) return false;
    if (this.isPastTime) return false;

    const [h1, m1] = this.value.startTime.split(':').map(Number);
    const [h2, m2] = this.value.endTime.split(':').map(Number);
    return (h2 * 60 + m2) > (h1 * 60 + m1);
  }

  get calculatedDuration(): string {
    if (!this.isValidRange) return '';
    const [h1, m1] = this.value.startTime.split(':').map(Number);
    const [h2, m2] = this.value.endTime.split(':').map(Number);
    
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    
    return `${hrs ? hrs + ' hrs ' : ''}${mins ? mins + ' mins' : ''}`.trim();
  }

  private isTimeBeforeOrEqual(t1: string, t2: string): boolean {
    if (!t1 || !t2) return false;
    const [h1, m1] = t1.split(':').map(Number);
    const [h2, m2] = t2.split(':').map(Number);
    return h1 < h2 || (h1 === h2 && m1 <= m2);
  }

  // ControlValueAccessor Implementation
  writeValue(val: any): void {
    if (val && typeof val === 'object' && 'date' in val && 'startTime' in val && 'endTime' in val) {
      this.value = { ...val };
    }
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
}
