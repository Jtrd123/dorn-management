'use client'

import { useState, useMemo } from 'react'
import {
  Users, CalendarClock, AlertTriangle, CheckCircle2,
  Search, Phone, Mail, CalendarRange,
  ChevronDown, UserPlus, FileText, Zap,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  getMockTenants,
  getTenantStats,
  type TenantRecord,
  type ContractStatus,
} from '@/lib/mock-tenant-data'

// ── Helpers ───────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

function expiryLabel(days: number): string {
  if (days < 0) return `เกินมา ${Math.abs(days)} วัน`
  if (days === 0) return 'หมดวันนี้'
  if (days <= 60) return `อีก ${days} วัน`
  const months = Math.floor(days / 30)
  return `อีก ~${months} เดือน`
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, bg }: {
  label: string; value: number; icon: React.ElementType
  color: string; bg: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums" style={{ color }}>{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ── Contract badge ────────────────────────────────────────────
const CONTRACT_META: Record<ContractStatus, { label: string; style: string }> = {
  ACTIVE:         { label: 'สัญญาปกติ',    style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  EXPIRING_SOON:  { label: 'ใกล้หมดสัญญา', style: 'bg-amber-50 text-amber-700 border-amber-200' },
  EXPIRED:        { label: 'หมดสัญญา',     style: 'bg-rose-50 text-rose-700 border-rose-200' },
}

const ROOM_STATUS_META = {
  OCCUPIED:    { label: 'มีผู้เช่า',  style: 'bg-purple-50 text-purple-700 border-purple-200' },
  OVERDUE:     { label: 'ค้างชำระ',   style: 'bg-rose-50 text-rose-700 border-rose-200' },
  MAINTENANCE: { label: 'แจ้งซ่อม',  style: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  VACANT:      { label: 'ว่าง',       style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
}

// ── Filter Pill ───────────────────────────────────────────────
function FilterPill({ label, active, onClick }: {
  label: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border
        ${active
          ? 'text-[#2e006b] border-transparent'
          : 'bg-white text-gray-500 border-gray-200 hover:border-purple-200 hover:text-[#2e006b]'
        }`}
      style={active ? { background: '#ffd445', borderColor: '#ffd445' } : {}}
    >
      {label}
    </button>
  )
}

// ── Tenant Card ───────────────────────────────────────────────
function TenantCard({ tenant }: { tenant: TenantRecord }) {
  const [expanded, setExpanded] = useState(false)
  const contract = CONTRACT_META[tenant.contractStatus]
  const roomMeta = ROOM_STATUS_META[tenant.room_status]
  const isUrgent = tenant.contractStatus !== 'ACTIVE'

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all
      ${tenant.contractStatus === 'EXPIRED'       ? 'border-rose-200' :
        tenant.contractStatus === 'EXPIRING_SOON' ? 'border-amber-200' :
        'border-gray-100'}`}>

      <div className="p-4">
        <div className="flex items-start gap-3">

          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
            style={{ background: '#f0ebff', color: '#2e006b' }}>
            {tenant.name[0]}
          </div>

          <div className="flex-1 min-w-0">
            {/* Name + badges */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-sm text-gray-800 truncate">{tenant.name}</p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="font-bold text-xs px-2 py-0.5 rounded-lg"
                    style={{ background: '#f0ebff', color: '#2e006b' }}>
                    ห้อง {tenant.room_number}
                  </span>
                  <span className="text-xs text-gray-500">ชั้น {tenant.floor} · {tenant.room_type}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${roomMeta.style}`}>
                    {roomMeta.label}
                  </span>
                </div>
              </div>

              {/* Expand toggle */}
              <button
                onClick={() => setExpanded((v) => !v)}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors mt-0.5"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Contract row */}
            <div className="flex items-center gap-3 mt-2.5 flex-wrap">
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${contract.style}`}>
                {isUrgent && <AlertTriangle className="w-3 h-3 shrink-0" />}
                {contract.label}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <CalendarClock className="w-3.5 h-3.5 shrink-0" />
                {expiryLabel(tenant.daysUntilExpiry)}
              </span>
              {tenant.roommates.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <UserPlus className="w-3.5 h-3.5 shrink-0" />
                  {tenant.roommates.length} ผู้พักร่วม
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-50 px-4 pb-4 pt-3 space-y-3">

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a href={`tel:${tenant.phone}`}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 hover:bg-purple-50 transition-colors group">
              <Phone className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 shrink-0" />
              <span className="text-sm text-gray-700 group-hover:text-purple-700 font-medium">{tenant.phone}</span>
            </a>
            <a href={`mailto:${tenant.email}`}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 hover:bg-purple-50 transition-colors group">
              <Mail className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 shrink-0" />
              <span className="text-sm text-gray-700 group-hover:text-purple-700 font-medium truncate">{tenant.email}</span>
            </a>
          </div>

          {/* Contract dates */}
          <div className="rounded-xl bg-gray-50 p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-2">
              <CalendarRange className="w-3.5 h-3.5" />
              สัญญาเช่า
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">วันเริ่ม</span>
              <span className="font-medium text-gray-800">{formatDate(tenant.start_date)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">วันสิ้นสุด</span>
              <span className={`font-medium ${isUrgent ? 'text-rose-600' : 'text-gray-800'}`}>
                {formatDate(tenant.end_date)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">ค่าเช่า/เดือน</span>
              <span className="font-bold" style={{ color: '#2e006b' }}>
                ฿{tenant.base_price.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Roommates */}
          {tenant.roommates.length > 0 && (
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs font-semibold text-gray-500 mb-2">
                ผู้พักร่วม ({tenant.roommates.length} คน)
              </p>
              <div className="space-y-1.5">
                {tenant.roommates.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{r.name}</span>
                    <a href={`tel:${r.phone}`} className="text-gray-500 hover:text-purple-600 text-xs">
                      {r.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-2">
            <a href={`/meter/${tenant.room_number}`}
              className="flex items-center justify-center gap-1.5 h-9 rounded-xl border text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Zap className="w-3.5 h-3.5" style={{ color: '#2e006b' }} />
              จดมิเตอร์
            </a>
            <a href={`/bills/${tenant.room_number}`}
              className="flex items-center justify-center gap-1.5 h-9 rounded-xl border text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <FileText className="w-3.5 h-3.5" style={{ color: '#2e006b' }} />
              จัดการบิล
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────
type FloorFilter = 'all' | 1 | 2 | 3
type ContractFilter = 'all' | ContractStatus

export function TenantsDashboard() {
  const stats = useMemo(() => getTenantStats(), [])
  const allTenants = useMemo(() => getMockTenants(), [])

  const [search, setSearch] = useState('')
  const [floorFilter, setFloorFilter] = useState<FloorFilter>('all')
  const [contractFilter, setContractFilter] = useState<ContractFilter>('all')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return allTenants.filter((t) => {
      const matchSearch = !q ||
        t.name.toLowerCase().includes(q) ||
        t.room_number.includes(q) ||
        t.phone.includes(q) ||
        t.email.toLowerCase().includes(q)
      const matchFloor = floorFilter === 'all' || t.floor === floorFilter
      const matchContract = contractFilter === 'all' || t.contractStatus === contractFilter
      return matchSearch && matchFloor && matchContract
    })
  }, [allTenants, search, floorFilter, contractFilter])

  return (
    <div className="px-4 sm:px-6 py-6 space-y-5 max-w-4xl mx-auto">

      {/* Header */}
      <div>
        <h2 className="font-bold text-lg" style={{ color: '#2e006b' }}>ข้อมูลผู้เช่า</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          ข้อมูลจากระบบ Mock — เชื่อมต่อ Supabase แล้วจะดึงข้อมูลจริง
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="ผู้เช่าทั้งหมด"  value={stats.total}        icon={Users}         color="#2e006b" bg="#f0ebff" />
        <StatCard label="สัญญาปกติ"       value={stats.active}       icon={CheckCircle2}  color="#059669" bg="#ecfdf5" />
        <StatCard label="ใกล้หมดสัญญา"   value={stats.expiringSoon}  icon={AlertTriangle}  color="#d97706" bg="#fefce8" />
        <StatCard label="หมดสัญญาแล้ว"   value={stats.expired}       icon={CalendarClock} color="#e11d48" bg="#fff1f2" />
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-3.5 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="ค้นหาชื่อ, ห้อง, เบอร์โทร, อีเมล..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-purple-600"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Floor */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">ชั้น:</span>
            {(['all', 1, 2, 3] as FloorFilter[]).map((f) => (
              <FilterPill
                key={String(f)}
                label={f === 'all' ? 'ทั้งหมด' : `ชั้น ${f}`}
                active={floorFilter === f}
                onClick={() => setFloorFilter(f)}
              />
            ))}
          </div>

          {/* Contract status */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">สัญญา:</span>
            {([
              { val: 'all',           label: 'ทั้งหมด' },
              { val: 'ACTIVE',        label: 'ปกติ' },
              { val: 'EXPIRING_SOON', label: 'ใกล้หมด' },
              { val: 'EXPIRED',       label: 'หมดแล้ว' },
            ] as { val: ContractFilter; label: string }[]).map(({ val, label }) => (
              <FilterPill
                key={val}
                label={label}
                active={contractFilter === val}
                onClick={() => setContractFilter(val)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-14 text-center">
            <Users className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm font-semibold text-gray-400">ไม่พบผู้เช่าที่ตรงกับเงื่อนไข</p>
            <p className="text-xs text-gray-400 mt-1">ลองเปลี่ยน filter หรือคำค้นหา</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500 px-1">แสดง {filtered.length} ราย</p>
            {filtered.map((t) => (
              <TenantCard key={`${t.room_number}-${t.id}`} tenant={t} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
