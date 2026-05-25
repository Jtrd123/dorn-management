import { MOCK_ROOMS } from './mock-data'
import { getRoomBillingData } from './mock-billing-data'

export type ReportBill = {
  room_number: string
  floor: number
  room_type: 'Standard' | 'Deluxe'
  tenant_name: string
  room_price: number
  water_units: number
  water_unit_price: number
  water_amount: number
  electric_units: number
  electric_unit_price: number
  electric_amount: number
  total_amount: number
  status: 'PAID' | 'UNPAID' | 'PENDING_APPROVAL'
}

export type OccupancyStats = {
  total: number
  vacant: number
  occupied: number
  overdue: number
  maintenance: number
  vacancyRate: number
  occupancyRate: number
  maintenanceRate: number
}

export type UtilityTotals = {
  totalWaterUnits: number
  totalElectricUnits: number
  totalWaterAmount: number
  totalElectricAmount: number
}

// ── Deterministic "random" from room number ──────────────────
function seedStatus(roomNumber: string, offset: number): 'PAID' | 'UNPAID' | 'PENDING_APPROVAL' {
  const n = parseInt(roomNumber.replace(/\D/g, '')) + offset
  const mod = n % 5
  if (mod < 3) return 'PAID'
  if (mod === 3) return 'UNPAID'
  return 'PENDING_APPROVAL'
}

// ── Monthly Revenue Report ───────────────────────────────────
export function getMonthlyReport(): ReportBill[] {
  return MOCK_ROOMS.filter((r) => r.status !== 'VACANT').map((room) => {
    const billing = getRoomBillingData(room.room_number)
    const last = billing.history[billing.history.length - 1]

    const wUnits = last.water_current - last.water_previous
    const eUnits = last.electric_current - last.electric_previous
    const wAmt = wUnits * last.water_unit_price
    const eAmt = eUnits * last.electric_unit_price

    const status: ReportBill['status'] =
      room.status === 'OVERDUE' ? 'UNPAID' : seedStatus(room.room_number, 0)

    return {
      room_number: room.room_number,
      floor: room.floor,
      room_type: room.room_type,
      tenant_name: room.tenant?.name ?? '–',
      room_price: billing.base_price,
      water_units: wUnits,
      water_unit_price: last.water_unit_price,
      water_amount: wAmt,
      electric_units: eUnits,
      electric_unit_price: last.electric_unit_price,
      electric_amount: eAmt,
      total_amount: billing.base_price + wAmt + eAmt,
      status,
    }
  })
}

// ── Occupancy Stats ──────────────────────────────────────────
export function getOccupancyStats(): OccupancyStats {
  const total = MOCK_ROOMS.length
  const vacant = MOCK_ROOMS.filter((r) => r.status === 'VACANT').length
  const occupied = MOCK_ROOMS.filter((r) => r.status === 'OCCUPIED').length
  const overdue = MOCK_ROOMS.filter((r) => r.status === 'OVERDUE').length
  const maintenance = MOCK_ROOMS.filter((r) => r.status === 'MAINTENANCE').length

  return {
    total,
    vacant,
    occupied,
    overdue,
    maintenance,
    vacancyRate: Math.round((vacant / total) * 100),
    occupancyRate: Math.round(((occupied + overdue + maintenance) / total) * 100),
    maintenanceRate: Math.round((maintenance / total) * 100),
  }
}

// ── Utility Totals ───────────────────────────────────────────
export function getUtilityTotals(): UtilityTotals {
  const occupiedRooms = MOCK_ROOMS.filter((r) => r.status !== 'VACANT')
  let totalWaterUnits = 0
  let totalElectricUnits = 0
  let totalWaterAmount = 0
  let totalElectricAmount = 0

  for (const room of occupiedRooms) {
    const billing = getRoomBillingData(room.room_number)
    const last = billing.history[billing.history.length - 1]
    const wUnits = last.water_current - last.water_previous
    const eUnits = last.electric_current - last.electric_previous
    totalWaterUnits += wUnits
    totalElectricUnits += eUnits
    totalWaterAmount += wUnits * last.water_unit_price
    totalElectricAmount += eUnits * last.electric_unit_price
  }

  return { totalWaterUnits, totalElectricUnits, totalWaterAmount, totalElectricAmount }
}

// ── Month options for selector ───────────────────────────────
export function getMonthOptions(): { value: string; label: string }[] {
  const MONTHS_TH = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
  ]
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    const value = d.toISOString().slice(0, 7)
    return {
      value,
      label: `${MONTHS_TH[d.getMonth()]} ${d.getFullYear() + 543}`,
    }
  })
}
