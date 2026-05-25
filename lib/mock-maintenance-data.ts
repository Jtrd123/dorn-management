import { MOCK_ROOMS } from './mock-data'

// ── Types ─────────────────────────────────────────────────────
export type MaintenanceStatus = 'PENDING' | 'RESOLVED'

export type MaintenanceItem = {
  id: string
  room_number: string
  floor: 1 | 2 | 3
  room_type: string
  tenant_name: string
  tenant_phone: string
  title: string
  description: string
  submitted_at: string
  status: MaintenanceStatus
  resolved_at?: string
  resolved_note?: string
}

// ── Resolved history (past month) ────────────────────────────
const RESOLVED_HISTORY: MaintenanceItem[] = [
  {
    id: 'r1', room_number: '105', floor: 1, room_type: 'Standard',
    tenant_name: 'สมชาย มีทรัพย์', tenant_phone: '081-234-5678',
    title: 'ประตูห้องน้ำปิดไม่สนิท',
    description: 'บานพับประตูห้องน้ำหลวม ปิดแล้วเปิดเองตลอด',
    submitted_at: '2026-04-10T09:00:00',
    status: 'RESOLVED',
    resolved_at: '2026-04-11T14:30:00',
    resolved_note: 'ช่างเปลี่ยนบานพับใหม่แล้ว',
  },
  {
    id: 'r2', room_number: '208', floor: 2, room_type: 'Standard',
    tenant_name: 'วิภา ใจดี', tenant_phone: '089-111-2222',
    title: 'หน้าต่างรั่ว ฝนตกน้ำซึม',
    description: 'ตรงขอบหน้าต่างด้านซ้าย น้ำฝนซึมเข้ามาในห้อง',
    submitted_at: '2026-04-18T16:45:00',
    status: 'RESOLVED',
    resolved_at: '2026-04-20T10:00:00',
    resolved_note: 'อุดซิลิโคนรอบขอบหน้าต่างแล้ว',
  },
  {
    id: 'r3', room_number: '312', floor: 3, room_type: 'Deluxe',
    tenant_name: 'กานดา ฤทธิ์ดี', tenant_phone: '097-555-6666',
    title: 'เต้ารับไฟฟ้าชำรุด',
    description: 'เต้ารับข้างเตียงเสียบแล้วอุปกรณ์ไม่ชาร์จ มีประกายไฟเล็กน้อย',
    submitted_at: '2026-04-25T11:20:00',
    status: 'RESOLVED',
    resolved_at: '2026-04-25T17:00:00',
    resolved_note: 'ช่างไฟเปลี่ยนเต้ารับใหม่ ตรวจสายไฟเรียบร้อย',
  },
  {
    id: 'r4', room_number: '115', floor: 1, room_type: 'Deluxe',
    tenant_name: 'สุดา แสงทอง', tenant_phone: '088-000-1111',
    title: 'ปั๊มน้ำห้องน้ำไม่ทำงาน',
    description: 'ฝักบัวน้ำไหลอ่อนมากจนเกือบไม่ออก',
    submitted_at: '2026-05-02T08:30:00',
    status: 'RESOLVED',
    resolved_at: '2026-05-03T13:00:00',
    resolved_note: 'ล้างตะแกรงกรองน้ำ และปรับวาล์วแล้ว',
  },
  {
    id: 'r5', room_number: '206', floor: 2, room_type: 'Standard',
    tenant_name: 'ณัฐ วงศ์วัฒน์', tenant_phone: '095-222-3333',
    title: 'มดขึ้นในห้อง',
    description: 'มดแดงขึ้นเป็นจำนวนมากบริเวณครัว',
    submitted_at: '2026-05-08T14:00:00',
    status: 'RESOLVED',
    resolved_at: '2026-05-09T09:30:00',
    resolved_note: 'แจ้งทีมกำจัดแมลงดำเนินการแล้ว วางยาเรียบร้อย',
  },
]

// ── Derive PENDING from MOCK_ROOMS ────────────────────────────
function getPendingItems(): MaintenanceItem[] {
  return MOCK_ROOMS
    .filter((r) => r.status === 'MAINTENANCE' && r.maintenance_request && r.tenant)
    .map((r) => ({
      id: r.maintenance_request!.id,
      room_number: r.room_number,
      floor: r.floor,
      room_type: r.room_type,
      tenant_name: r.tenant!.name,
      tenant_phone: r.tenant!.phone,
      title: r.maintenance_request!.title,
      description: r.maintenance_request!.description,
      submitted_at: r.maintenance_request!.submitted_at,
      status: 'PENDING' as MaintenanceStatus,
    }))
}

// ── Public API ─────────────────────────────────────────────────
export function getMockMaintenanceItems(): MaintenanceItem[] {
  return [
    ...getPendingItems(),
    ...RESOLVED_HISTORY,
  ].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
}

export function getMaintenanceStats() {
  const all = getMockMaintenanceItems()
  return {
    total: all.length,
    pending: all.filter((x) => x.status === 'PENDING').length,
    resolved: all.filter((x) => x.status === 'RESOLVED').length,
  }
}
