import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'component-process',
  standalone: true,
  imports: [NgClass],
  templateUrl: './process.html',
})
export class ComponentProcess {
  @Input() steps: string[] = ['Booking', 'Choose Car', 'Confirm'];
  @Input() currentStep: number = 1;
  @Input() size: 'sm' | 'base' = 'base';

  get progressWidth(): number { //คำนวณ ดูว่าอยุ่processไหนแล้ว -> แปลงเป็น % ไปให้ ui 
    if (this.steps.length <= 1) return 0;//น้อยกว่า1 return 0
    const activeIndex = Math.min(Math.max(this.currentStep - 1, 0), this.steps.length - 1);//ปรับเป็นลำดับแบบarray + validtion กัน ค่าติดลบ < 0 หรือ > จนprocess
    return (activeIndex / (this.steps.length - 1)) * 100;// คำนวณเป็นอัตราส่วน%
  }

  protected readonly baseClasses = 'w-full flex justify-center select-none';

  protected readonly sizeClasses = {
    sm: 'py-2 px-4 mb-4 sm:mb-8',
    base: 'py-4 px-6 mb-6 sm:mb-10'
  };

  protected readonly circleSizeClasses = {
    sm: 'w-7 h-7 text-xs',
    base: 'w-9 h-9 text-sm md:w-10 md:h-10 md:text-base'
  };
}
