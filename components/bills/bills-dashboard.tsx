'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  FileText, CheckCircle2, Clock, AlertCircle,
  Filter, Receipt, ThumbsUp, Banknote,
  Droplets, Zap, ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getMockBills, getBillStats, formatThaiMonth,
  type BillRecord, type BillStatus,
} from '@/lib/mock-bills-data'

// ── Helpers ───────────────────────────────────────────────────
const STATUS_META: Record<BillStatus, { label: string; style: string; icon: React.ElementType }> = {
  PENDING_APPROVAL: { label: 'รออนุมัติ', style: 'bg-sky-50 text-sky-700 border-sky-200',      icon: Clock },
  UNPAID:           { label: 'ค้างชำระ',  style: 'bg-rose-50 text-rose-700 border-rose-200',   icon: AlertCircle },
  PAID:             { label: 'ชำระแล้ว',  style: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color, bg }: {
  label: string; value: string; sub?: string
  icon: React.ElementType; color: string; bg: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold tabular-nums leading-none" style={{ color }}>{value}</p>
        {sub && <p className="text-[11px] text-gray-500 mt-0.5">{sub}</p>}
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ── Filter Pill ───────────────────────────────────────────────
function FilterPill({ label, active, count, onClick }: {
  label: string; active: boolean; count?: number; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border
        ${active ? 'text-[#2e006b] border-transparent' : 'bg-white text-gray-500 border-gray-200 hover:border-purple-200 hover:text-[#2e006b]'}`}
      style={active ? { background: '#ffd445', borderColor: '#ffd445' } : {}}
    >
      {label}
      {count !== undefined && (
        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-[#2e006b]/15 text-[#2e006b]' : 'bg-gray-100 text-gray-500'}`}>
          {count}
        </span>
      )}
    </button>
  )
}

// ── Bill Row ──────────────────────────────────────────────────
function BillRow({ bill, onApprove, onMarkPaid }: {
  bill: BillRecord
  onApprove: (roomNumber: string) => void
  onMarkPaid: (roomNumber: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const meta = STATUS_META[bill.status]
  const StatusIcon = meta.icon

  return (
    <>
      <tr className={`border-t border-gray-50 hover:bg-purple-50/20 transition-colors ${expanded ? 'bg-purple-50/10' : ''}`}>
        {/* Room */}
        <td className="px-4 py-3">
          <p className="font-bold text-sm" style={{ color: '#2e006b' }}>{bill.room_number}</p>
          <p className="text-[11px] text-gray-500">ชั้น {bill.floor} · {bill.room_type}</p>
        </td>
        {/* Tenant */}
        <td className="px-4 py-3 max-w-[120px]">
          <p className="text-sm text-gray-700 font-medium truncate">{bill.tenant_name}</p>
          <p className="text-[11px] text-gray-500">{bill.tenant_phone}</p>
        </td>
        {/* Breakdown */}
        <td className="px-4 py-3 text-right text-sm tabular-nums text-gray-600">
          {bill.room_price.toLocaleString()}
        </td>
        <td className="px-4 py-3 text-right text-sm tabular-nums text-sky-700">
          {bill.water_amount.toLocaleString()}
          <span className="text-[10px] text-gray-500 ml-0.5">({bill.water_units}u)</span>
        </td>
        <td className="px-4 py-3 text-right text-sm tabular-nums text-amber-700">
          {bill.electric_amount.toLocaleString()}
          <span className="text-[10px] text-gray-500 ml-0.5">({bill.electric_units}u)</span>
        </td>
        {/* Total */}
        <td className="px-4 py-3 text-right font-bold text-sm tabular-nums" style={{ color: '#2e006b' }}>
          ฿{bill.total_amount.toLocaleString()}
        </td>
        {/* Status */}
        <td className="px-4 py-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${meta.style}`}>
            <StatusIcon className="w-3 h-3 shrink-0" />
            {meta.label}
          </span>
        </td>
        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            {bill.status === 'PENDING_APPROVAL' && (
              <Button
                size="sm"
                onClick={() => onApprove(bill.room_number)}
                className="h-7 px-2.5 text-xs font-semibold text-white gap-1"
                style={{ background: '#2e006b' }}
              >
                <ThumbsUp className="w-3 h-3" />
                อนุมัติ
              </Button>
            )}
            {bill.status === 'UNPAID' && (
              <Button
                size="sm"
                onClick={() => onMarkPaid(bill.room_number)}
                className="h-7 px-2.5 text-xs font-semibold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Banknote className="w-3 h-3" />
                รับชำระ
              </Button>
            )}
            {bill.status === 'PAID' && (
              <Link href={`/receipt/${bill.room_number}`}>
                <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs font-medium gap-1 border-purple-200 text-purple-700 hover:bg-purple-50">
                  <Receipt className="w-3 h-3" />
                  ใบเสร็จ
                </Button>
              </Link>
            )}
            {/* Expand detail */}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded row */}
      {expanded && (
        <tr className="border-t border-purple-50 bg-purple-50/20">
          <td colSpan={8} className="px-6 py-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Droplets className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <div>
                  <p className="text-gray-500">มิเตอร์น้ำ</p>
                  <p className="font-medium text-gray-800">
                    {bill.water_previous} → {bill.water_current}
                    <span className="text-sky-600 ml-1">({bill.water_units} หน่วย × ฿{bill.water_unit_price})</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-gray-500">มิเตอร์ไฟ</p>
                  <p className="font-medium text-gray-800">
                    {bill.electric_previous} → {bill.electric_current}
                    <span className="text-amber-600 ml-1">({bill.electric_units} หน่วย × ฿{bill.electric_unit_price})</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <div>
                  <p className="text-gray-500">รอบบิล</p>
                  <p className="font-medium text-gray-800">{formatThaiMonth(bill.billing_month)}</p>
                </div>
              </div>
              <div className="flex justify-end items-center">
                <Link href={`/bills/${bill.room_number}`} className="text-xs text-purple-600 hover:underline font-medium">
                  ดูรายละเอียด →
                </Link>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ── Main Dashboard ────────────────────────────────────────────
type FloorFilter = 'all' | 1 | 2 | 3
type StatusFilter = 'all' | BillStatus

export function BillsDashboard() {
  const stats = useMemo(() => getBillStats(), [])
  const [bills, setBills] = useState<BillRecord[]>(() => getMockBills())
  const [floorFilter, setFloorFilter] = useState<FloorFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filtered = useMemo(() => {
    return bills.filter((b) => {
      const mf = floorFilter === 'all' || b.floor === floorFilter
      const ms = statusFilter === 'all' || b.status === statusFilter
      return mf && ms
    })
  }, [bills, floorFilter, statusFilter])

  const counts = useMemo(() => ({
    pending: bills.filter((b) => b.status === 'PENDING_APPROVAL').length,
    unpaid:  bills.filter((b) => b.status === 'UNPAID').length,
    paid:    bills.filter((b) => b.status === 'PAID').length,
  }), [bills])

  function handleApprove(roomNumber: string) {
    setBills((prev) => prev.map((b) => b.room_number === roomNumber ? { ...b, status: 'UNPAID' as BillStatus } : b))
  }

  function handleMarkPaid(roomNumber: string) {
    setBills((prev) => prev.map((b) => b.room_number === roomNumber ? { ...b, status: 'PAID' as BillStatus } : b))
  }

  // Bulk approve all PENDING
  function handleApproveAll() {
    setBills((prev) => prev.map((b) => b.status === 'PENDING_APPROVAL' ? { ...b, status: 'UNPAID' as BillStatus } : b))
  }

  const currentMonth = formatThaiMonth(bills[0]?.billing_month ?? new Date().toISOString())

  return (
    <div className="px-4 sm:px-6 py-6 space-y-5 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-lg" style={{ color: '#2e006b' }}>จัดการบิล</h2>
          <p className="text-xs text-gray-500 mt-0.5">รอบบิล: {currentMonth} · ข้อมูล Mock</p>
        </div>
        {counts.pending > 0 && (
          <Button
            onClick={handleApproveAll}
            className="h-9 gap-2 text-sm font-semibold text-white shrink-0"
            style={{ background: '#2e006b' }}
          >
            <ThumbsUp className="w-4 h-4" />
            อนุมัติทั้งหมด ({counts.pending})
          </Button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="บิลทั้งหมด"   value={`${stats.total} ห้อง`}                 icon={FileText}    color="#2e006b" bg="#f0ebff" />
        <StatCard label="รออนุมัติ"    value={`${counts.pending} ห้อง`} sub={`฿${stats.pendingAmount.toLocaleString()}`} icon={Clock}       color="#0284c7" bg="#f0f9ff" />
        <StatCard label="ค้างชำระ"     value={`${counts.unpaid} ห้อง`}  sub={`฿${stats.unpaidAmount.toLocaleString()}`}  icon={AlertCircle} color="#e11d48" bg="#fff1f2" />
        <StatCard label="ชำระแล้ว"     value={`${counts.paid} ห้อง`}                  icon={CheckCircle2} color="#059669" bg="#ecfdf5" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-3.5 flex flex-wrap items-center gap-3">
        <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        {/* Floor */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">ชั้น:</span>
          {(['all', 1, 2, 3] as FloorFilter[]).map((f) => (
            <FilterPill key={String(f)} label={f === 'all' ? 'ทั้งหมด' : `ชั้น ${f}`} active={floorFilter === f} onClick={() => setFloorFilter(f)} />
          ))}
        </div>
        <div className="w-px h-5 bg-gray-100 hidden sm:block" />
        {/* Status */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">สถานะ:</span>
          <FilterPill label="ทั้งหมด"   active={statusFilter === 'all'}               count={bills.length}      onClick={() => setStatusFilter('all')} />
          <FilterPill label="รออนุมัติ" active={statusFilter === 'PENDING_APPROVAL'}  count={counts.pending}    onClick={() => setStatusFilter('PENDING_APPROVAL')} />
          <FilterPill label="ค้างชำระ"  active={statusFilter === 'UNPAID'}            count={counts.unpaid}     onClick={() => setStatusFilter('UNPAID')} />
          <FilterPill label="ชำระแล้ว"  active={statusFilter === 'PAID'}              count={counts.paid}       onClick={() => setStatusFilter('PAID')} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-purple-50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[780px]">
            <thead>
              <tr style={{ background: '#faf8ff' }}>
                {['ห้อง', 'ผู้เช่า', 'ค่าห้อง', 'ค่าน้ำ', 'ค่าไฟ', 'รวม', 'สถานะ', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                    ไม่มีบิลในหมวดนี้
                  </td>
                </tr>
              ) : (
                filtered.map((bill) => (
                  <BillRow
                    key={bill.room_number}
                    bill={bill}
                    onApprove={handleApprove}
                    onMarkPaid={handleMarkPaid}
                  />
                ))
              )}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f5f0ff' }} className="border-t-2 border-purple-100">
                <td colSpan={2} className="px-4 py-3 font-bold text-xs" style={{ color: '#2e006b' }}>
                  รวม {filtered.length} ห้อง
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums text-sm" style={{ color: '#2e006b' }}>
                  {filtered.reduce((s, b) => s + b.room_price, 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums text-sm text-sky-700">
                  {filtered.reduce((s, b) => s + b.water_amount, 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums text-sm text-amber-700">
                  {filtered.reduce((s, b) => s + b.electric_amount, 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums text-sm" style={{ color: '#2e006b' }}>
                  ฿{filtered.reduce((s, b) => s + b.total_amount, 0).toLocaleString()}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
