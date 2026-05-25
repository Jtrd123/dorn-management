export type BillStatus = 'PENDING_APPROVAL' | 'UNPAID' | 'PAID'

export type MonthlyReading = {
  billing_month: string        // 'YYYY-MM-01'
  water_previous: number
  water_current: number
  electric_previous: number
  electric_current: number
  water_unit_price: number
  electric_unit_price: number
  room_price: number
  total_amount: number
  status: BillStatus
}

export type RoomBillingData = {
  room_number: string
  floor: number
  room_type: 'Standard' | 'Deluxe'
  base_price: number
  tenant_name: string
  history: MonthlyReading[]  // newest last
}

// ── Current rate settings (Admin-configurable) ───────────────
export const CURRENT_RATES = {
  water_unit_price: 18,       // บาท/หน่วย
  electric_unit_price: 7,     // บาท/หน่วย
  updated_at: '2026-04-01',
  updated_by: 'ผู้ดูแลระบบ',
} as const

// ── Generate deterministic history for any room ──────────────
function monthOffset(n: number): string {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() + n)
  return d.toISOString().slice(0, 10)
}

function generateHistory(roomNumber: string, basePrice: number): MonthlyReading[] {
  const seed = parseInt(roomNumber.replace(/\D/g, '')) || 101
  const avgWater = 8 + (seed % 7)       // หน่วย/เดือน
  const avgElectric = 120 + (seed % 80)

  let waterMeter = 1000 + seed * 12
  let electricMeter = 10000 + seed * 35

  const rates = { water: 18, electric: 7 }
  const months: MonthlyReading[] = []

  // Generate 4 months of history (months -5 to -2)
  for (let i = -5; i <= -2; i++) {
    const jitter = (k: number) => Math.round(Math.sin(seed * k + i) * (k === 1 ? 3 : 25))
    const wUnits = Math.max(2, avgWater + jitter(1))
    const eUnits = Math.max(30, avgElectric + jitter(2))

    const wPrev = waterMeter
    const ePrev = electricMeter
    waterMeter += wUnits
    electricMeter += eUnits

    const wAmt = wUnits * rates.water
    const eAmt = eUnits * rates.electric

    months.push({
      billing_month: monthOffset(i),
      water_previous: wPrev,
      water_current: waterMeter,
      electric_previous: ePrev,
      electric_current: electricMeter,
      water_unit_price: rates.water,
      electric_unit_price: rates.electric,
      room_price: basePrice,
      total_amount: basePrice + wAmt + eAmt,
      status: 'PAID',
    })
  }

  // Last month = most recent closed bill (month -1)
  const jw = Math.max(2, avgWater + Math.round(Math.cos(seed) * 2))
  const je = Math.max(30, avgElectric + Math.round(Math.sin(seed * 3) * 15))
  const wPrev = waterMeter
  const ePrev = electricMeter
  waterMeter += jw
  electricMeter += je

  months.push({
    billing_month: monthOffset(-1),
    water_previous: wPrev,
    water_current: waterMeter,
    electric_previous: ePrev,
    electric_current: electricMeter,
    water_unit_price: rates.water,
    electric_unit_price: rates.electric,
    room_price: basePrice,
    total_amount: basePrice + jw * rates.water + je * rates.electric,
    status: 'PAID',
  })

  return months
}

// ── Tenant lookup (matches mock-data.ts seed) ────────────────
const TENANT_NAMES: Record<string, string> = {
  '101': 'สมชาย มีทรัพย์',   '102': 'วิภา ใจดี',       '103': 'ธนา รักษ์สกุล',
  '104': 'นภา ทองดี',       '105': 'กฤษฏ์ เมืองงาม',  '106': 'ปราณี สุขใส',
  '107': 'ณัฐ วงศ์วัฒน์',   '108': 'พัชรา ดีงาม',     '109': 'อัครา พุทธรักษ์',
  '110': 'สุดา แสงทอง',     '111': 'บุญมา ศิริสุข',   '112': 'กานดา ฤทธิ์ดี',
}

export function getRoomBillingData(roomNumber: string): RoomBillingData {
  const floor = parseInt(roomNumber[0]) || 1
  const roomNum = parseInt(roomNumber.slice(1)) || 1
  const isDeluxe = roomNum > 8
  const basePrice = isDeluxe ? 4500 : 3000

  return {
    room_number: roomNumber,
    floor,
    room_type: isDeluxe ? 'Deluxe' : 'Standard',
    base_price: basePrice,
    tenant_name: TENANT_NAMES[roomNumber] ?? `ผู้เช่าห้อง ${roomNumber}`,
    history: generateHistory(roomNumber, basePrice),
  }
}

// ── Helpers ──────────────────────────────────────────────────
export function formatThaiMonth(dateStr: string): string {
  const MONTHS_TH = [
    'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
    'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม',
  ]
  const d = new Date(dateStr)
  return `${MONTHS_TH[d.getMonth()]} ${d.getFullYear() + 543}`
}

export function currentBillingMonth(): string {
  const d = new Date()
  d.setDate(1)
  return d.toISOString().slice(0, 10)
}
