import { Pipe, PipeTransform } from '@angular/core';

/**
 * ThaiTimePipe: จัดฟอร์แมตเวลาให้เป็นแบบภาษาไทย (เช่น 09:40 น.)
 */
@Pipe({
  name: 'thaiTime',
  standalone: true
})
export class ThaiTimePipe implements PipeTransform {
  transform(value: any): string {
    if (!value) return '';

    // รองรับกรณีค่าที่ส่งเข้าเป็นแค่เวลา เช่น "09:40" หรือ "09:40:00"
    if (typeof value === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
      const parts = value.split(':');
      return `${parts[0]}:${parts[1]} น.`;
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) return '';

    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm} น.`;
  }
}
