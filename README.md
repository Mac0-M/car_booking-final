# 🚗 ระบบจองรถ (Car Booking System)

พัฒนาด้วย **NestJS + Angular + SQLite** เข้าถึงผ่าน **LINE** และ Web Browser

---

## Tech Stack

| ส่วน     | Technology                        |
| -------- | --------------------------------- |
| Frontend | Angular + Tailwind CSS            |
| Backend  | NestJS                            |
| Database | SQLite (better-sqlite3 + TypeORM) |
| Auth     | JWT (local email/password)        |
| Expose   | Ngrok (สำหรับ LINE LIFF)          |

---

## Features

### User / Booker

- Login ด้วย email/password
- หน้ารายการจองรถยนต์:
  - **ตารางปฏิทิน (Toast UI Calendar v2)** เป็นหน้าแรกหลัก แสดงแยกสีตามประเภทรถ (Sedan=น้ำเงิน, Pickup=เขียว, Van=ม่วง, SUV=ส้ม, อื่นๆ=ชมพู)
  - รองรับการลากคลุมหรือกดเพื่อเริ่มการจองจากปฏิทิน และกดเพื่อเปิดดูรายละเอียดทริปผ่าน Modal
  - สลับการดูเป็นแบบ **บล็อก (Blocks)** ปรับปรุงตัวกรองอย่างละเอียด (ตามรถ, วันเวลาแบบ datetime-local, และกรองผู้ที่เกี่ยวข้องทั้งหมด)
- **ระบบฝากจอง (Proxy Booking)**: จองรถยนต์ให้ผู้อื่นได้ โดยผู้จอง ผู้ฝากจอง และผู้ร่วมเดินทาง (Passenger) มีสิทธิ์ร่วมจัดการและยกเลิกทริป และจำนวนสะสมการจองจะไปเพิ่มที่ผู้ฝากจองโดยตรง
- **ประวัติการจองทั้งหมด (Booking History)**: แสดงการจองทุกประเภท (สำเร็จ, ยกเลิก, กำลังเดินทาง) ทั้งในรูปแบบ **บล็อก (Block View)** และ **ตารางรายการ (List View)**
- **แก้ไขข้อมูลส่วนตัว**: รองรับการอัปโหลดและแสดง Preview รูปภาพโปรไฟล์ พร้อมปุ่มยกเลิกดึงกลับหน้าหลัก

### Admin

- **จัดการรถยนต์**:
  - เพิ่ม/แก้ไขรถยนต์ กำหนดสถานะ Available / Unavailable และแก้ไขเลขไมล์สะสม (`total_mile`) ได้โดยตรง
  - อัปโหลดรูปภาพรถยนต์พร้อมแสดง Preview ได้ทันที
  - กรองคัดกรองรถยนต์ตามประเภท, ความจุ, สถานะความพร้อม, และสถานะการเติมน้ำมัน
  - ทำการเสร็จสิ้นการเดินทาง (Complete Booking) และบันทึกระยะทางใช้งานเพิ่มเติมโดย **ไม่บังคับ** กรอกเลขไมล์
- จัดการ User: ดูรายละเอียดข้อมูลผู้ใช้ได้ (แต่ไม่อนุญาตให้แก้ไข Role)

### Super Admin

- ได้รับสิทธิ์ในการลบผู้ใช้งาน และ **เปลี่ยนบทบาท (Role)** ของผู้ใช้รายอื่นได้เท่านั้น (Admin และ User ปกติไม่สามารถแก้ไขได้)
- เปิด-ปิดการ seeding ไอดี Super Admin เริ่มต้นผ่าน `.env` (จะตรวจสอบก่อนเสมอเพื่อไม่ให้สร้างไอดีซ้ำซ้อน)

---

## Roles

```
User → Admin → Super_Admin
```

Super_Admin สร้างผ่าน environment variable ตอน bootstrap ครั้งแรกเท่านั้น

---

## Database Schema

### User

| Field        | Type       | Note                                             |
| ------------ | ---------- | ------------------------------------------------ |
| user_id      | INTEGER PK | AUTOINCREMENT                                    |
| user_name    | TEXT NN    |                                                  |
| password     | TEXT NN    | hashed (bcrypt)                                  |
| email        | TEXT NN    | UNIQUE                                           |
| phone        | TEXT NN    |                                                  |
| profile_img  | TEXT       | URL path                                         |
| total_booked | INTEGER NN | default: 0                                       |
| role         | TEXT NN    | default: 'User' (User / Admin / Super_Admin)     |
| create_at    | TEXT NN    | default: CURRENT_TIMESTAMP (YYYY-MM-DD HH:MM:SS) |
| last_update  | TEXT NN    | default: CURRENT_TIMESTAMP (YYYY-MM-DD HH:MM:SS) |

### Vehicle

| Field            | Type       | Note                                             |
| ---------------- | ---------- | ------------------------------------------------ |
| vehicle_id       | INTEGER PK | AUTOINCREMENT                                    |
| vehicle_name     | TEXT NN    |                                                  |
| type             | TEXT NN    | Sedan / Pickup / Van / SUV / Other               |
| capacity         | INTEGER NN |                                                  |
| re_fuel          | BOOLEAN NN | default: false (เติมน้ำมันแล้วยัง)               |
| total_mile       | INTEGER NN | default: 0                                       |
| last_maintenance | TEXT NN    | default: CURRENT_TIMESTAMP (YYYY-MM-DD HH:MM:SS) |
| status           | TEXT NN    | default: 'available' (available / unavailable)   |
| vehicle_img      | TEXT       | URL path                                         |
| total_bookby     | INTEGER NN | default: 0                                       |
| last_update      | TEXT NN    | default: CURRENT_TIMESTAMP (YYYY-MM-DD HH:MM:SS) |

### Booking

| Field         | Type       | Note                                             |
| ------------- | ---------- | ------------------------------------------------ |
| book_id       | INTEGER PK | AUTOINCREMENT                                    |
| booked_by     | INTEGER NN | FK → users(user_id)                              |
| passenger     | INTEGER    | FK → users(user_id) (ผู้ร่วมเดินทาง)             |
| booked_for    | INTEGER    | FK → users(user_id) (ฝากจองให้คนอื่น)            |
| vehicle_id    | INTEGER NN | FK → vehicles(vehicle_id)                        |
| depart        | TEXT NN    | YYYY-MM-DD HH:MM:SS                              |
| return        | TEXT       | YYYY-MM-DD HH:MM:SS                              |
| destination   | TEXT       |                                                  |
| use_for       | TEXT       |                                                  |
| mile_distance | INTEGER    |                                                  |
| status        | TEXT NN    | default: 'booked' (booked / complete / cancel)   |
| create_at     | TEXT NN    | default: CURRENT_TIMESTAMP (YYYY-MM-DD HH:MM:SS) |
| last_update   | TEXT NN    | default: CURRENT_TIMESTAMP (YYYY-MM-DD HH:MM:SS) |

---

## API Routes

Base URL: `http://localhost:3000/api/v1`

### Auth

| Method | Route         | Role   |
| ------ | ------------- | ------ |
| POST   | `/auth/login` | Public |
| GET    | `/auth/me`    | Auth   |

### Users

| Method | Route                      | Role           |
| ------ | -------------------------- | -------------- |
| GET    | `/users`                   | Admin          |
| GET    | `/users/:id`               | Admin / ตัวเอง |
| PATCH  | `/users/:id`               | Admin / ตัวเอง |
| DELETE | `/users/:id`               | Super Admin    |
| PATCH  | `/users/:id/role`          | Super Admin    |
| POST   | `/users/:id/profile-image` | Auth           |

### Vehicles

| Method | Route                  | Role  | Note                                                |
| ------ | ---------------------- | ----- | --------------------------------------------------- |
| GET    | `/vehicles`            | Auth  | ดูทั้งหมด (กรองตาม type, status, capacity, search)  |
| GET    | `/vehicles/:id`        | Auth  | ดูรายละเอียดรถ                                      |
| GET    | `/vehicles/available`  | Auth  | ดูรถว่าง (กรองตาม depart, return)                   |
| POST   | `/vehicles`            | Admin | เพิ่มรถใหม่                                         |
| PATCH  | `/vehicles/:id`        | Admin | แก้ไขข้อมูลรถ                                       |
| DELETE | `/vehicles/:id`        | Admin | ลบรถ                                                |
| PATCH  | `/vehicles/:id/status` | Admin | เปลี่ยนสถานะความพร้อมใช้งาน (available/unavailable) |
| POST   | `/vehicles/:id/image`  | Admin | อัปโหลดรูปภาพรถ                                     |

### Bookings

| Method | Route                    | Role         | Note                                                                                   |
| ------ | ------------------------ | ------------ | -------------------------------------------------------------------------------------- |
| GET    | `/bookings`              | Auth         | ดูทั้งหมด (กรองตาม status, vehicle_id, booked_by, passenger, depart_start, depart_end) |
| GET    | `/bookings/my`           | Auth         | ดูการจองของตนเองและที่มีรายชื่อเป็นผู้โดยสาร                                           |
| GET    | `/bookings/:id`          | Auth         | ดูรายละเอียดการจอง                                                                     |
| POST   | `/bookings`              | Auth         | สร้างการจองใหม่ (ป้องกัน double booking)                                               |
| PATCH  | `/bookings/:id/cancel`   | Auth / Admin | ยกเลิกการจอง (เจ้าของ/ผู้โดยสาร หรือ Admin เท่านั้น)                                   |
| PATCH  | `/bookings/:id/complete` | Admin        | เสร็จสิ้นการจองและอัปเดตระยะทางรถ                                                      |

### Response Format

```json
{
  "success": true,
  "data": {},
  "message": "สำเร็จ"
}
```

---

## Project Structure

```
car-booking/
├── backend/
│   └── src/
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts   # POST /login, GET /me
│       │   ├── auth.service.ts      # bcrypt + JWT
│       │   ├── jwt.guard.ts
│       │   └── roles.guard.ts
│       ├── users/
│       │   ├── users.module.ts
│       │   ├── users.controller.ts
│       │   ├── users.service.ts
│       │   └── user.entity.ts
│       ├── vehicles/
│       │   ├── vehicles.module.ts
│       │   ├── vehicles.controller.ts
│       │   ├── vehicles.service.ts
│       │   └── vehicle.entity.ts
│       ├── bookings/
│       │   ├── bookings.module.ts
│       │   ├── bookings.controller.ts
│       │   ├── bookings.service.ts
│       │   └── booking.entity.ts
│       ├── common/
│       │   ├── roles.decorator.ts
│       │   ├── current-user.decorator.ts
│       │   └── response.interceptor.ts
│       ├── app.module.ts
│       └── main.ts
│
│   ├── uploads/                  # static files (profile / vehicle img)
│   ├── database/                 # database files (sqlite)
│   │   └── car_booking.sqlite
│   ├── .env
│   └── package.json
│
└── frontend/
    └── src/app/
        ├── core/
        │   ├── auth.service.ts      # login, logout, token, auto-login
        │   ├── api.service.ts       # HttpClient wrapper
        │   ├── auth.guard.ts
        │   ├── jwt.interceptor.ts
        │   └── core.module.ts
        ├── shared/
        │   ├── thai-date.pipe.ts    # Buddhist era format
        │   ├── thai-time.pipe.ts    # 24h format
        │   └── shared.module.ts
        ├── pages/
        │   ├── login/
        │   ├── vehicles/            # list + form (add/edit)
        │   ├── bookings/            # my-bookings + create (3-step)
        │   ├── admin/               # user list + booking list
        │   └── profile/
        ├── app.module.ts
        ├── app-routing.module.ts
        └── app.component.ts         # navbar + router-outlet

        ├── package.json
        ├── tailwind.config.js
        └── proxy.conf.json          # /api → localhost:3000
```

---

## Security

- Password hashing ด้วย **bcrypt**
- ป้องกัน SQL Injection ผ่าน **TypeORM parameterized query**
- JWT token เก็บใน `localStorage` พร้อม `expireDate` → auto-login
- `state` parameter แบบ randomized ป้องกัน CSRF (สำหรับ OAuth flow)

---

## Responsive

- รองรับทั้ง **มือถือ** และ **Desktop**
- รูปภาพ `profile_img` / `vehicle_img` เก็บเป็น URL path บน local → NestJS serve static

---

## Performance

- Token + expireDate เก็บ local → ทำ **auto-login** ได้โดยไม่ต้องยิง API
- รูปภาพ serve จาก `uploads/` folder โดยตรง (ไม่เก็บ binary ใน SQLite)

---

## Port Mapping

| Port    | Service                                      |
| ------- | -------------------------------------------- |
| `:3000` | NestJS (API + static uploads)                |
| `:4200` | Angular dev server (proxy → 3000)            |
| Ngrok   | expose `:3000` → public URL สำหรับ LINE LIFF |

> **Production:** build Angular → copy `dist/` ไปไว้ใน `backend/public/` แล้ว NestJS serve ทั้ง API + frontend ผ่าน port เดียว จากนั้น Ngrok expose port นั้นพอ

---

## Getting Started

### Backend

```bash
cd backend
npm install
cp .env.example .env        # ใส่ JWT_SECRET, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASS
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm start                   # Angular dev server + proxy → :3000
```

### Ngrok (สำหรับ LINE)

```bash
ngrok http 3000
```

---

## Key Packages

**Backend**

- `@nestjs/jwt` + `passport-jwt`
- `@nestjs/typeorm` + `better-sqlite3`
- `bcrypt`
- `class-validator` + `class-transformer`
- `@nestjs/serve-static` + `multer`

**Frontend**

- `@angular/core` 17+
- `tailwindcss` + `postcss`
- `@angular/router`
