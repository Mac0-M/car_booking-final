import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';
import { ThaiTimePipe } from './thai-time.pipe';
import { EngTimePipe } from './eng-time.pipe';

/**
 * AppTimePipe: ทรานส์ฟอร์มเวลาโดยเลือกตามภาษาปัจจุบัน (ไทย -> thaiTime, อังกฤษ -> engTime)
 */
@Pipe({
  name: 'appTime',
  standalone: true,
  pure: false
})
export class AppTimePipe implements PipeTransform {
  private readonly langService = inject(LanguageService);
  private readonly thaiTimePipe = new ThaiTimePipe();
  private readonly engTimePipe = new EngTimePipe();

  transform(value: any): string {
    if (!value) return '';
    return this.langService.currentLang() === 'th'
      ? this.thaiTimePipe.transform(value)
      : this.engTimePipe.transform(value);
  }
}
