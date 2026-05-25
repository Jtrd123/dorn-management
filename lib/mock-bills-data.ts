import { MOCK_ROOMS } from './mock-data'
import { formatThaiMonth } from './mock-billing-data'

export type BillStatus = 'PENDING_APPROVAL' | 'UNPAID' | 'PAID'

export type BillRecord = {
  room_number: string
  floor: 1 | 2 | 3
  room_type: string
  room_status: 'OCCUPIED' | 'OVERDUE' | 'MAINTENANCE'
  tenant_name: string
  tenant_phone: string
  billing_month: string          // 'YYYY-MM-01'
  room_price: number
  water_previous: number
  water_current: number
  water_units: number
  water_unit_price: number
  water_amount: number
  electric_previous: number
  electric_current: number
  electric_units: number
  electric_unit_price: number
  electric_amount: number
  total_amount: number
  status: BillStatus
}

// ── Deterministic meter readings for current month ────────────
function seedVal(roomNumber: string): number {
  return parseInt(roomNumber.replace(/\D/g, '')) || 101
}

function genCurrentBill(
  roomNumber: string,
  basePrice: number,
  roomStatus: 'OCCUPIED' | 'OVERDUE' | 'MAINTENANCE',
): Omit<BillRecord, 'room_number' | 'floor' | 'room_type' | 'room_status' | 'tenant_name' | 'tenant_phone'> {
  const s = seedVal(roomNumber)
  const avgW = 8 + (s % 7)
  const avgE = 120 + (s % 80)

  // Simulate previous meter from history end-point
  const wPrev = 1000 + s * 12 + avgW * 5 + Math.round(Math.sin(s) * 3)
  const ePrev = 10000 + s * 35 + avgE * 5 + Math.round(Math.sin(s * 3) * 15)
  const wUnits = Math.max(3, avgW + Math.round(Math.cos(s * 2) * 2))
  const eUnits = Math.max(40, avgE + Math.round(Math.sin(s * 4) * 20))
  const wPrice = 18
  const ePrice = 7
  const wAmt = wUnits * wPrice
  const eAmt = eUnits * ePrice

  // Bill status: MAINTENANCE → PENDING, OVERDUE → UNPAID, OCCUPIED varies
  let status: BillStatus
  if (roomStatus === 'MAINTENANCE') status = 'PENDING_APPROVAL'
  else if (roomStatus === 'OVERDUE') status = 'UNPAID'
  else {
    const n = s % 3
    status = n === 0 ? 'PAID' : n === 1 ? 'UNPAID' : 'PENDING_APPROVAL'
  }

  const today = new Date('2026-05-24')
  today.setDate(1)

  return {
    billing_month: today.toISOString().slice(0, 10),
    room_price: basePrice,
    water_previous: wPrev,
    water_current: wPrev + wUnits,
    water_units: wUnits,
    water_unit_price: wPrice,
    water_amount: wAmt,
    electric_previous: ePrev,
    electric_current: ePrev + eUnits,
    electric_units: eUnits,
    electric_unit_price: ePrice,
    electric_amount: eAmt,
    total_amount: basePrice + wAmt + eAmt,
    status,
  }
}

// ── Public API ─────────────────────────────────────────────────
export function getMockBills(): BillRecord[] {
  return MOCK_ROOMS
    .filter((r) => r.status !== 'VACANT' && r.tenant)
    .map((r) => {
      const rs = r.status as 'OCCUPIED' | 'OVERDUE' | 'MAINTENANCE'
      const bill = genCurrentBill(r.room_number, r.base_price, rs)
      return {
        room_number: r.room_number,
        floor: r.floor,
        room_type: r.room_type,
        room_status: rs,
        tenant_name: r.tenant!.name,
        tenant_phone: r.tenant!.phone,
        ...bill,
      } satisfies BillRecord
    })
    .sort((a, b) => {
      // Sort: PENDING first, then UNPAID, then PAID
      const order = { PENDING_APPROVAL: 0, UNPAID: 1, PAID: 2 }
      return order[a.status] - order[b.status] || a.room_number.localeCompare(b.room_number)
    })
}

export function getMockBillByRoom(roomNumber: string): BillRecord | null {
  return getMockBills().find((b) => b.room_number === roomNumber) ?? null
}

export function getBillStats() {
  const all = getMockBills()
  return {
    total: all.length,
    pending: all.filter((b) => b.status === 'PENDING_APPROVAL').length,
    unpaid: all.filter((b) => b.status === 'UNPAID').length,
    paid: all.filter((b) => b.status === 'PAID').length,
    unpaidAmount: all.filter((b) => b.status === 'UNPAID').reduce((s, b) => s + b.total_amount, 0),
    pendingAmount: all.filter((b) => b.status === 'PENDING_APPROVAL').reduce((s, b) => s + b.total_amount, 0),
    totalAmount: all.reduce((s, b) => s + b.total_amount, 0),
  }
}

export { formatThaiMonth }
