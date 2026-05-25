import { MOCK_ROOMS } from './mock-data'
import type { RoomStatus } from './types'

// ── Types ─────────────────────────────────────────────────────
export type ContractStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED'

export type TenantRecord = {
  room_number: string
  floor: 1 | 2 | 3
  room_type: string
  room_status: RoomStatus
  base_price: number
  // tenant info
  id: string
  name: string
  phone: string
  email: string
  start_date: string
  end_date: string
  roommates: { name: string; phone: string }[]
  // computed
  daysUntilExpiry: number
  contractStatus: ContractStatus
}

// ── Helpers ───────────────────────────────────────────────────
function daysUntil(dateStr: string): number {
  const today = new Date('2026-05-24') // deterministic for mock
  const end = new Date(dateStr)
  return Math.ceil((end.getTime() - today.getTime()) / 86400000)
}

function contractStatus(days: number): ContractStatus {
  if (days < 0) return 'EXPIRED'
  if (days <= 60) return 'EXPIRING_SOON'
  return 'ACTIVE'
}

// ── Public API ─────────────────────────────────────────────────
export function getMockTenants(): TenantRecord[] {
  return MOCK_ROOMS
    .filter((r) => r.tenant != null)
    .map((r) => {
      const days = daysUntil(r.tenant!.end_date)
      return {
        room_number: r.room_number,
        floor: r.floor,
        room_type: r.room_type,
        room_status: r.status,
        base_price: r.base_price,
        id: r.tenant!.id,
        name: r.tenant!.name,
        phone: r.tenant!.phone,
        email: r.tenant!.email,
        start_date: r.tenant!.start_date,
        end_date: r.tenant!.end_date,
        roommates: r.tenant!.roommates,
        daysUntilExpiry: days,
        contractStatus: contractStatus(days),
      } satisfies TenantRecord
    })
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry) // urgent first
}

export function getTenantStats() {
  const all = getMockTenants()
  return {
    total: all.length,
    active: all.filter((t) => t.contractStatus === 'ACTIVE').length,
    expiringSoon: all.filter((t) => t.contractStatus === 'EXPIRING_SOON').length,
    expired: all.filter((t) => t.contractStatus === 'EXPIRED').length,
  }
}
