# Changelog — ระบบจัดการหอพัก (Dorm Management System)

> Stack: Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Shadcn UI  
> Database: Supabase (PostgreSQL) — ยังอยู่ในโหมด Mock Data  
> Theme: Primary `#2e006b` (ม่วงเข้ม) · Accent `#ffd445` (เหลืองทอง)

---

## v0.4.0 — Reports, Receipt & Responsive Layout
**วันที่:** 2026-05-20

### เพิ่มใหม่ (Added)
- **หน้า Reports Dashboard** (`/reports`) — รายงาน 2 แท็บ พร้อม Filter เดือน/ปี
  - แท็บ "รายรับประจำเดือน": Summary Cards (Paid / Unpaid / Target) + ตารางรายห้องพร้อมสถานะ + ลิงก์ใบเสร็จ
  - แท็บ "การใช้งานทรัพยากร": อัตราการเข้าพัก, Bar charts สถานะห้อง, ยอดรวมหน่วยน้ำ-ไฟทั้งอาคาร
  - Export CSV (Mock) — ดาวน์โหลดไฟล์ได้จริง
- **ใบเสร็จรับเงิน** (`/receipt/[roomNumber]`) — A5 Landscape พร้อม Print CSS สำหรับ Dot Matrix
  - ล้าง background สีทั้งหมดเมื่อพิมพ์ (เหลือแค่กรอบดำ)
  - แสดงรายการ ค่าห้อง / ค่าน้ำ (เลขมิเตอร์ก่อน-หลัง) / ค่าไฟ / ยอดรวม
  - แปลงยอดเป็นตัวอักษรไทย "บาทถ้วน" อัตโนมัติ
  - ช่องลงชื่อผู้รับเงิน / ผู้จ่ายเงิน
  - `@page { size: A5 landscape; margin: 5mm; }`
- **Sidebar Layout** (`AppLayout`) — ใช้งานร่วมกันทุกหน้า Admin
  - Desktop: Sidebar fixed ซ้ายมือ (w-60) พร้อม nav items + user info
  - Mobile: Hamburger button เปิด Shadcn Sheet (drawer) จาก left
  - Active state highlight พร้อม gold dot
- **Responsive Room Grid** — ปรับ Grid ผังห้อง
  - Mobile: `grid-cols-4` (4 ห้อง/แถว)
  - Desktop: `grid-cols-8` (8 ห้อง/แถว)
  - ตารางใน Reports: `overflow-x-auto` รองรับ horizontal scroll บน mobile

### Library ใหม่
- `lib/thai-baht.ts` — แปลงตัวเลขเป็นตัวอักษรภาษาไทย (รองรับถึง 9,999,999 บาท)
- `lib/mock-reports-data.ts` — Generator ข้อมูล mock สำหรับ Reports + Occupancy

### Shadcn Components เพิ่ม
- `sheet` · `select` · `tabs`

---

## v0.3.0 — Utility Meter Input Form
**วันที่:** 2026-05-20

### เพิ่มใหม่ (Added)
- **หน้าจดมิเตอร์** (`/meter/[roomNumber]`) — ฟอร์มบันทึกเลขมิเตอร์น้ำ-ไฟประจำเดือน
  - **Dual-Input by Role**: ADMIN → บิลสถานะ `UNPAID` ทันที / TENANT → `PENDING_APPROVAL`
  - **Hard Block**: ห้ามกรอกเลขน้อยกว่าเดือนก่อน (ติด error + block ปุ่ม Save)
  - **Anomaly Warning**: แจ้งเตือนสีแดงหากใช้เกิน ±50% จากค่าเฉลี่ย 3 เดือน (ยังกด Save ได้)
  - **Rate Snapshot**: คัดลอก unit price ปัจจุบันลง payload ทันที — เปลี่ยนราคาในอนาคตไม่กระทบบิลเก่า
  - Bill Summary Card แบบ real-time คำนวณตามที่กรอก
  - ตารางประวัติ 3 เดือนย้อนหลัง (toggle show/hide)
  - Success Screen แสดง Role + Status หลัง submit
- **Mock Billing History** — `lib/mock-billing-data.ts` generator สร้างประวัติมิเตอร์ 5 เดือน/ห้อง แบบ deterministic

### Shadcn Components เพิ่ม
- `separator` · `alert`

---

## v0.2.0 — Admin Dashboard (Room Grid)
**วันที่:** 2026-05-20

### เพิ่มใหม่ (Added)
- **Admin Dashboard** (`/dashboard`) — ผังห้องพักแบบ Grid View
  - แสดง 3 ชั้น ชั้นละ 16 ห้อง (รวม 48 ห้อง)
  - Stat Cards: ห้องทั้งหมด / มีผู้เช่า / ค้างชำระ / รอซ่อม
  - Color-coded Room Cards ตามสถานะ (Vacant/Occupied/Overdue/Maintenance)
  - Floor header แสดง summary count ต่อสถานะ
- **Room Detail Dialog** — คลิกห้องเพิ่มเปิด Modal
  - ข้อมูลผู้เช่าหลัก + ผู้พักร่วม
  - ลิงก์ "จดมิเตอร์" / "จัดการบิล"
  - ปุ่ม Admin: "แก้ไขเสร็จ → เปลี่ยนสถานะกลับปกติ" (สำหรับห้อง MAINTENANCE)
  - ปุ่ม Dev: "จำลองผู้เช่าแจ้งซ่อม" → เปลี่ยนสถานะเป็น MAINTENANCE ทันที
- **Mock Data** — 48 ห้อง พร้อม tenant data + maintenance requests แบบ deterministic
- **Custom Theme** เพิ่มใน `globals.css`
  - Override `--primary: #2e006b` / `--accent: #ffd445`
  - CSS variables สำหรับ room status tints

### Shadcn Components เพิ่ม
- `dialog` · `badge`

---

## v0.1.0 — Project Init + Login
**วันที่:** 2026-05-20

### เพิ่มใหม่ (Added)
- **Bootstrap** `create-next-app` + Shadcn UI + Tailwind CSS v4
- **หน้า Login** (`/login`) — Mock Auth
  - Credentials: `admin` / `admin1234` → Role `ADMIN`
  - Set cookie `mock_session` (JSON: `{role, name}`)
  - Redirect → `/dashboard` หลัง login สำเร็จ
  - Show/Hide password, Loading spinner, Error message
  - Dev hint box แสดง credentials สำหรับทดสอบ
- **หน้า Dashboard Placeholder** (`/dashboard`) → ย้ายไป v0.2.0
- **Root redirect** `/` → `/login`
- **Mock Auth utilities** — `lib/mock-auth.ts`
  - `setMockSession` / `getMockSession` / `clearMockSession`
- **Logout** — ลบ cookie + redirect `/login`

### Shadcn Components เริ่มต้น
- `button` · `card` · `input` · `label`

---

## Database Schema (Supabase) — ออกแบบแล้ว รอเชื่อมต่อ

```sql
profiles          -- ผู้ใช้ + Role (ADMIN / TENANT / USER)
room_types        -- ประเภทห้อง + ราคาฐาน
rooms             -- 48 ห้อง + สถานะ
contracts         -- สัญญาเช่า + roommates (JSONB)
utility_bills     -- บิลน้ำ-ไฟ + rate snapshot
maintenance_requests -- แจ้งซ่อม
```

---

*Generated: 2026-05-20 | Next target: v0.5.0 — Supabase Integration*
