import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';
import { ThaiDatePipe } from './thai-date.pipe';
import { EngDatePipe } from './eng-date.pipe';

/**
 * AppDatePipe: ทรานส์ฟอร์มวันที่โดยเลือกตามภาษาปัจจุบัน (ไทย -> thaiDate, อังกฤษ -> engDate)
 */
@Pipe({
  name: 'appDate',
  standalone: true,
  pure: false
})
export class AppDatePipe implements PipeTransform {
  private readonly langService = inject(LanguageService);
  private readonly thaiDatePipe = new ThaiDatePipe();
  private readonly engDatePipe = new EngDatePipe();

  transform(value: any, format: 'monthYear' | 'full' = 'full'): string {
    if (!value) return '';
    return this.langService.currentLang() === 'th'
      ? this.thaiDatePipe.transform(value, format)
      : this.engDatePipe.transform(value, format);
  }
}
