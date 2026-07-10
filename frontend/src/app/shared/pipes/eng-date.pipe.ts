import { Pipe, PipeTransform } from '@angular/core';

export const ENG_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * EngDatePipe: จัดฟอร์แมตวันที่ให้เป็นแบบภาษาอังกฤษ (เช่น 16 Jun 2026)
 */
@Pipe({
  name: 'engDate',
  standalone: true
})
export class EngDatePipe implements PipeTransform {
  transform(value: any, format: 'monthYear' | 'full' = 'full'): string {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';

    const month = ENG_MONTHS[date.getMonth()];
    const year = date.getFullYear();

    if (format === 'monthYear') {
      return `${month} ${year}`;
    }

    const day = date.getDate();
    return `${day} ${month} ${year}`;
  }
}
