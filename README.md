# 🚗 ระบบจองรถภายใน (Internal Car Booking System)

ระบบจองรถสำหรับใช้งานภายในองค์กร พัฒนาด้วย **NestJS + Angular + SQLite** เข้าถึงผ่าน **LINE** และ Web Browser

---

## Tech Stack

| ส่วน | Technology |
|------|-----------|
| Frontend | Angular + Tailwind CSS |
| Backend | NestJS |
| Database | SQLite (better-sqlite3 + TypeORM) |
| Auth | JWT (local email/password) |
| Expose | Ngrok (สำหรับ LINE LIFF) |

---

## Features

### User
- Login ด้วย email/password
- ดูรถทั้งหมด (list / grid / ตาราง) [มี filter] 
- ยกเลิกการจองของตัวเอง, แก้ไขข้อมูลส่วนตัว
- ดูข้อมูล User ทั้งหมด (ชื่อ และ คนขับ)
- แก้ไขข้อมูลส่วนตัว

### Admin
- จัดการรถ (เพิ่ม / แก้ไข / ลบ / เปลี่ยน status)
- ดู Booking ทั้งหมด, Cancel / Complete booking
- จัดการ User (แก้ไข / ลบ / เปลี่ยน role)

### Super Admin
- เพิ่ม Admin ผ่าน config (ไม่มี endpoint — seed จาก `.env`)
- ลบ User ได้

---

## Roles

```
User → Admin → Super_Admin
```

Super_Admin สร้างผ่าน environment variable ตอน bootstrap ครั้งแรกเท่านั้น

---

## Database Schema

### User
| Field | Type | Note |
|-------|------|------|
| user_id | PK | |
| user_name | TEXT NN | |
| password | TEXT | hashed (bcrypt) |
| email | TEXT NN | |
| phone | TEXT NN | |
| profile_img | TEXT | URL path |
| total_booked | NUM | |
| role | ENUM | User / Admin / Super_Admin |
| create_at | TEXT NN | Y/M/D H:M:S |
| last_update | TEXT NN | Y/M/D H:M:S |

### Vehicle
| Field | Type | Note |
|-------|------|------|
| vehicle_id | PK | |
| vehicle_name | TEXT NN | |
| type | ENUM NN | Sedan / Pickup / Van / SUV / etc. |
| capacity | NUM NN | |
| re_fuel | TEXT NN | |
| total_mile | NUM | |
| last_maintenance | TEXT NN | Y/M/D H:M:S |
| status | ENUM NN | available / unavailable |
| vehicle_img | TEXT | URL path |
| last_update | TEXT NN | Y/M/D H:M:S |
| total_bookby | NUM | |

### Booking
| Field | Type | Note |
|-------|------|------|
| book_id | PK | |
| booked_by | FK → User | ผู้จอง |
| passenger | FK → User | ผู้โดยสาร |
| vehicle_id | FK → Vehicle | |
| depart | TEXT NN | Y/M/D H:M:S |
| return | TEXT | Y/M/D H:M:S |
| destination | TEXT | |
| use_for | TEXT | |
| mile_distance | NUM | |
| status | ENUM NN | booked / complete / cancel |
| create_at | TEXT NN | Y/M/D H:M:S |
| last_update | TEXT NN | Y/M/D H:M:S |

---

## API Routes

Base URL: `http://localhost:3000/api/v1`

### Auth
| Method | Route | Role |
|--------|-------|------|
| POST | `/auth/login` | Public |
| GET | `/auth/me` | Auth |

### Users
| Method | Route | Role |
|--------|-------|------|
| GET | `/users` | Admin |
| GET | `/users/:id` | Admin / ตัวเอง |
| PATCH | `/users/:id` | Admin / ตัวเอง |
| DELETE | `/users/:id` | Super Admin |
| PATCH | `/users/:id/role` | Super Admin |
| POST | `/users/:id/profile-image` | Auth |

### Vehicles
| Method | Route | Role |
|--------|-------|------|
| GET | `/vehicles` | Auth |
| GET | `/vehicles/:id` | Auth |
| GET | `/vehicles/available` | Auth |
| POST | `/vehicles` | Admin |
| PATCH | `/vehicles/:id` | Admin |
| DELETE | `/vehicles/:id` | Admin |
| PATCH | `/vehicles/:id/status` | Admin |
| POST | `/vehicles/:id/image` | Admin |

### Bookings
| Method | Route | Role |
|--------|-------|------|
| GET | `/bookings` | Admin |
| GET | `/bookings/my` | Auth |
| GET | `/bookings/:id` | Admin / เจ้าของ |
| POST | `/bookings` | Auth |
| PATCH | `/bookings/:id/cancel` | Auth / Admin |
| PATCH | `/bookings/:id/complete` | Admin |

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
│   ├── uploads/                     # static files (profile / vehicle img)
│   ├── car_booking.sqlite
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

| Port | Service |
|------|---------|
| `:3000` | NestJS (API + static uploads) |
| `:4200` | Angular dev server (proxy → 3000) |
| Ngrok | expose `:3000` → public URL สำหรับ LINE LIFF |

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
