import { Pipe, PipeTransform } from '@angular/core';

/**
 * ThaiDatePipe: จัดฟอร์แมตวันที่ให้เป็นแบบภาษาไทย (เช่น 16 มิ.ย. 2026)
 */
@Pipe({
  name: 'thaiDate',
  standalone: true
})
export class ThaiDatePipe implements PipeTransform {
  transform(value: any): string {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';

    const day = date.getDate();
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear() + 543;

    return `${day} ${month} ${year}`;
  }
}
