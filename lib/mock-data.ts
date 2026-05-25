import { Room, RoomStatus } from './types'

const TENANTS = [
  { id: 't1', name: 'สมชาย มีทรัพย์', phone: '081-234-5678', email: 'somchai@mail.com', start_date: '2025-06-01', end_date: '2026-05-31', roommates: [{ name: 'สมหญิง มีทรัพย์', phone: '081-999-0001' }] },
  { id: 't2', name: 'วิภา ใจดี', phone: '089-111-2222', email: 'wipa@mail.com', start_date: '2025-01-01', end_date: '2026-12-31', roommates: [] },
  { id: 't3', name: 'ธนา รักษ์สกุล', phone: '062-333-4444', email: 'thana@mail.com', start_date: '2024-09-01', end_date: '2025-08-31', roommates: [{ name: 'ปิยะ ชุมแสง', phone: '062-555-6666' }] },
  { id: 't4', name: 'นภา ทองดี', phone: '091-777-8888', email: 'napa@mail.com', start_date: '2025-03-01', end_date: '2026-02-28', roommates: [] },
  { id: 't5', name: 'กฤษฏ์ เมืองงาม', phone: '064-123-0000', email: 'krit@mail.com', start_date: '2025-07-01', end_date: '2026-06-30', roommates: [] },
  { id: 't6', name: 'ปราณี สุขใส', phone: '083-456-7891', email: 'pranee@mail.com', start_date: '2024-11-01', end_date: '2025-10-31', roommates: [{ name: 'มาลี พวงมาลัย', phone: '083-111-2222' }] },
  { id: 't7', name: 'ณัฐ วงศ์วัฒน์', phone: '095-222-3333', email: 'nat@mail.com', start_date: '2025-02-01', end_date: '2026-01-31', roommates: [] },
  { id: 't8', name: 'พัชรา ดีงาม', phone: '086-444-5555', email: 'patchara@mail.com', start_date: '2025-05-01', end_date: '2026-04-30', roommates: [] },
  { id: 't9', name: 'อัครา พุทธรักษ์', phone: '077-666-7777', email: 'akara@mail.com', start_date: '2025-04-01', end_date: '2026-03-31', roommates: [{ name: 'ชาติ บุญมาก', phone: '077-888-9999' }] },
  { id: 't10', name: 'สุดา แสงทอง', phone: '088-000-1111', email: 'suda@mail.com', start_date: '2025-08-01', end_date: '2026-07-31', roommates: [] },
  { id: 't11', name: 'บุญมา ศิริสุข', phone: '093-222-4444', email: 'boonma@mail.com', start_date: '2024-10-01', end_date: '2025-09-30', roommates: [] },
  { id: 't12', name: 'กานดา ฤทธิ์ดี', phone: '097-555-6666', email: 'kanda@mail.com', start_date: '2025-01-15', end_date: '2026-01-14', roommates: [{ name: 'ลัดดา สวยงาม', phone: '097-777-8888' }] },
]

const MAINTENANCE_REQUESTS = [
  { id: 'm1', title: 'เครื่องปรับอากาศขัดข้อง', description: 'แอร์ไม่เย็น มีเสียงดังผิดปกติตั้งแต่เมื่อคืน', submitted_at: '2026-05-18T10:30:00' },
  { id: 'm2', title: 'ท่อน้ำรั่ว', description: 'น้ำหยดจากฝ้าเพดานห้องน้ำ', submitted_at: '2026-05-19T08:15:00' },
  { id: 'm3', title: 'ไฟในห้องน้ำเสีย', description: 'หลอดไฟห้องน้ำดับทั้งหมด เปลี่ยนหลอดเองแล้วยังไม่ติด', submitted_at: '2026-05-20T07:00:00' },
]

// ───────────────────────────────────────────────────────────────
// generate 48 rooms: floors 1-3, rooms 01-16 per floor
// ───────────────────────────────────────────────────────────────
const STATUS_PATTERN: RoomStatus[] = [
  'OCCUPIED', 'OCCUPIED', 'OCCUPIED', 'OCCUPIED',
  'OCCUPIED', 'OCCUPIED', 'OVERDUE',  'OVERDUE',
  'OCCUPIED', 'MAINTENANCE', 'OCCUPIED', 'OCCUPIED',
  'VACANT',   'VACANT',   'VACANT',   'VACANT',
]

export const MOCK_ROOMS: Room[] = Array.from({ length: 3 }, (_, floorIdx) => {
  const floor = (floorIdx + 1) as 1 | 2 | 3
  return Array.from({ length: 16 }, (_, roomIdx) => {
    const roomNum = roomIdx + 1
    const roomNumber = `${floor}${String(roomNum).padStart(2, '0')}`
    const isDeluxe = roomNum > 8
    const status = STATUS_PATTERN[roomIdx]
    const tenantIndex = (floorIdx * 4 + Math.floor(roomIdx / 2)) % TENANTS.length
    const maintenanceIndex = floorIdx % MAINTENANCE_REQUESTS.length

    const hasTenant = status !== 'VACANT'
    const hasMaintenance = status === 'MAINTENANCE'

    return {
      id: floorIdx * 16 + roomIdx + 1,
      room_number: roomNumber,
      floor,
      room_type: isDeluxe ? 'Deluxe' : 'Standard',
      base_price: isDeluxe ? 4500 : 3000,
      status,
      tenant: hasTenant ? TENANTS[tenantIndex] : undefined,
      maintenance_request: hasMaintenance ? MAINTENANCE_REQUESTS[maintenanceIndex] : undefined,
    } satisfies Room
  })
}).flat()

export const FLOOR_LABELS: Record<number, string> = {
  1: 'ชั้น 1',
  2: 'ชั้น 2',
  3: 'ชั้น 3',
}
