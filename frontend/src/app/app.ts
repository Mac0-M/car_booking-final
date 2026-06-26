import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header';

/**
 * App Component (Root Component)
 * - เป็นคอมโพเนนต์หลักระดับบนสุดของระบบ (Root Component)
 * - ทำหน้าที่เป็น Container สำหรับแท็ก <app-root> ใน index.html
 * - ดึง RouterOutlet เข้ามาใช้งานเพื่อแสดงผลแต่ละหน้าเพจตามการจับคู่เส้นทาง (Routing)
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {}
