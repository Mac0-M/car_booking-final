import { Pipe, PipeTransform } from '@angular/core';

export const THAI_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

/**
 * ThaiDatePipe: จัดฟอร์แมตวันที่ให้เป็นแบบภาษาไทย (เช่น 16 มิ.ย. 2026)
 */
@Pipe({
  name: 'thaiDate',
  standalone: true
})
export class ThaiDatePipe implements PipeTransform {
  transform(value: any, format: 'monthYear' | 'full' = 'full'): string {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';

    const month = THAI_MONTHS[date.getMonth()];
    const year = date.getFullYear() + 543;

    if (format === 'monthYear') {
      return `${month} ${year}`;
    }

    const day = date.getDate();
    return `${day} ${month} ${year}`;
  }
}
