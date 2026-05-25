'use client'

import { useState, useMemo } from 'react'
import {
  BarChart3, TrendingUp, AlertCircle, Target,
  Droplets, Zap, DoorOpen, Wrench, Download, FileSpreadsheet,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  getMonthlyReport, getOccupancyStats, getUtilityTotals,
  getMonthOptions, type ReportBill,
} from '@/lib/mock-reports-data'
import { formatThaiMonth } from '@/lib/mock-billing-data'
import Link from 'next/link'

// ── Status badge ─────────────────────────────────────────────
const BILL_STATUS: Record<ReportBill['status'], { label: string; style: string }> = {
  PAID:             { label: 'ชำระแล้ว',    style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  UNPAID:           { label: 'ค้างชำระ',    style: 'bg-rose-50 text-rose-700 border-rose-200' },
  PENDING_APPROVAL: { label: 'รออนุมัติ',   style: 'bg-yellow-50 text-yellow-700 border-yellow-300' },
}

function StatusBadge({ status }: { status: ReportBill['status'] }) {
  const s = BILL_STATUS[status]
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${s.style}`}>
      {s.label}
    </span>
  )
}

// ── Summary card ─────────────────────────────────────────────
function SummaryCard({ label, value, sub, icon: Icon, color, accent }: {
  label: string; value: string; sub?: string; icon: React.ElementType
  color: string; accent?: boolean
}) {
  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4 shadow-sm border"
      style={accent
        ? { background: '#2e006b', borderColor: '#2e006b' }
        : { background: 'white', borderColor: '#ede9fe' }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: accent ? 'rgba(255,212,69,0.2)' : color + '18' }}>
        <Icon className="w-6 h-6" style={{ color: accent ? '#ffd445' : color }} />
      </div>
      <div className="min-w-0">
        <p className={`text-2xl font-bold leading-none ${accent ? 'text-white' : ''}`}
          style={accent ? {} : { color }}>
          {value}
        </p>
        <p className={`text-xs mt-1 leading-tight ${accent ? 'text-white/70' : 'text-gray-500'}`}>{label}</p>
        {sub && <p className={`text-[10px] mt-0.5 ${accent ? 'text-white/55' : 'text-gray-400'}`}>{sub}</p>}
      </div>
    </div>
  )
}

// ── Stat bar ─────────────────────────────────────────────────
function StatBar({ label, value, max, color, pct }: {
  label: string; value: number; max: number; color: string; pct: number
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-bold tabular-nums" style={{ color }}>
          {value} ห้อง <span className="text-gray-500 font-normal">({pct}%)</span>
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(value / max) * 100}%`, background: color }}
        />
      </div>
    </div>
  )
}

// ── Export mock ──────────────────────────────────────────────
function handleExport(type: 'csv' | 'excel') {
  const bills = getMonthlyReport()
  const headers = ['ห้อง', 'ชั้น', 'ผู้เช่า', 'ค่าห้อง', 'ค่าน้ำ', 'ค่าไฟ', 'รวม', 'สถานะ']
  const rows = bills.map((b) => [
    b.room_number, b.floor, b.tenant_name,
    b.room_price, b.water_amount, b.electric_amount, b.total_amount, b.status,
  ])
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `report-${type}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Revenue Report Tab ───────────────────────────────────────
function RevenueReport({ selectedMonth }: { selectedMonth: string }) {
  const bills = useMemo(() => getMonthlyReport(), [])

  const summary = useMemo(() => {
    const paid = bills.filter((b) => b.status === 'PAID').reduce((s, b) => s + b.total_amount, 0)
    const unpaid = bills.filter((b) => b.status !== 'PAID').reduce((s, b) => s + b.total_amount, 0)
    return { paid, unpaid, total: paid + unpaid }
  }, [bills])

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          label="ยอดจัดเก็บได้แล้ว"
          value={`฿${summary.paid.toLocaleString()}`}
          sub={`${bills.filter((b) => b.status === 'PAID').length} ห้อง`}
          icon={TrendingUp}
          color="#10b981"
          accent={false}
        />
        <SummaryCard
          label="ยังค้างชำระ"
          value={`฿${summary.unpaid.toLocaleString()}`}
          sub={`${bills.filter((b) => b.status !== 'PAID').length} ห้อง`}
          icon={AlertCircle}
          color="#f43f5e"
        />
        <SummaryCard
          label="เป้าหมายรวม"
          value={`฿${summary.total.toLocaleString()}`}
          sub={formatThaiMonth(selectedMonth + '-01')}
          icon={Target}
          color="#2e006b"
          accent
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-purple-50 overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" style={{ color: '#2e006b' }} />
            <span className="font-bold text-sm" style={{ color: '#2e006b' }}>
              รายละเอียดรายห้อง — {formatThaiMonth(selectedMonth + '-01')}
            </span>
          </div>
          <span className="text-xs text-gray-500">{bills.length} ห้อง</span>
        </div>

        {/* overflow-x-auto for mobile horizontal scroll */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
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
              {bills.map((bill, i) => (
                <tr
                  key={bill.room_number}
                  className={`border-t border-gray-50 hover:bg-purple-50/30 transition-colors ${
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'
                  }`}
                >
                  <td className="px-4 py-3 font-bold" style={{ color: '#2e006b' }}>
                    {bill.room_number}
                    <span className="ml-1.5 text-[10px] text-gray-500 font-normal">ชั้น{bill.floor}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-[120px] truncate">{bill.tenant_name}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                    {bill.room_price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-sky-700">
                    {bill.water_amount.toLocaleString()}
                    <span className="text-[10px] text-gray-500 ml-0.5">({bill.water_units}u)</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-amber-700">
                    {bill.electric_amount.toLocaleString()}
                    <span className="text-[10px] text-gray-500 ml-0.5">({bill.electric_units}u)</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-bold" style={{ color: '#2e006b' }}>
                    {bill.total_amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={bill.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/receipt/${bill.room_number}`}
                      className="text-xs text-purple-600 hover:underline whitespace-nowrap"
                    >
                      ใบเสร็จ →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f5f0ff' }} className="border-t-2 border-purple-100">
                <td colSpan={2} className="px-4 py-3 font-bold text-xs" style={{ color: '#2e006b' }}>
                  รวมทั้งหมด
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums" style={{ color: '#2e006b' }}>
                  {bills.reduce((s, b) => s + b.room_price, 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums text-sky-700">
                  {bills.reduce((s, b) => s + b.water_amount, 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums text-amber-700">
                  {bills.reduce((s, b) => s + b.electric_amount, 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums" style={{ color: '#2e006b' }}>
                  {bills.reduce((s, b) => s + b.total_amount, 0).toLocaleString()}
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

// ── Occupancy Tab ────────────────────────────────────────────
function OccupancyReport() {
  const occ = useMemo(() => getOccupancyStats(), [])
  const util = useMemo(() => getUtilityTotals(), [])

  return (
    <div className="space-y-6">
      {/* Occupancy stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="อัตราการเข้าพัก" value={`${occ.occupancyRate}%`}
          sub={`${occ.occupied + occ.overdue + occ.maintenance}/${occ.total} ห้อง`}
          icon={DoorOpen} color="#7c3aed" />
        <SummaryCard label="ห้องว่าง" value={`${occ.vacancyRate}%`}
          sub={`${occ.vacant} ห้องว่างอยู่`}
          icon={DoorOpen} color="#10b981" />
        <SummaryCard label="ค้างชำระ" value={`${occ.overdue}`}
          sub="ห้อง" icon={AlertCircle} color="#f43f5e" />
        <SummaryCard label="รอซ่อมบำรุง" value={`${occ.maintenance}`}
          sub={`${occ.maintenanceRate}% ของทั้งหมด`}
          icon={Wrench} color="#f59e0b" />
      </div>

      {/* Occupancy bar chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-purple-50 p-6">
        <h3 className="font-bold text-sm mb-5" style={{ color: '#2e006b' }}>
          การกระจายสถานะห้องพัก (อาคารรวม)
        </h3>
        <div className="space-y-4">
          <StatBar label="มีผู้เช่า (ปกติ)" value={occ.occupied} max={occ.total} color="#7c3aed" pct={Math.round((occ.occupied / occ.total) * 100)} />
          <StatBar label="ค้างชำระ" value={occ.overdue} max={occ.total} color="#f43f5e" pct={Math.round((occ.overdue / occ.total) * 100)} />
          <StatBar label="แจ้งซ่อม" value={occ.maintenance} max={occ.total} color="#f59e0b" pct={occ.maintenanceRate} />
          <StatBar label="ว่าง" value={occ.vacant} max={occ.total} color="#10b981" pct={occ.vacancyRate} />
        </div>
      </div>

      {/* Utility totals */}
      <div className="bg-white rounded-2xl shadow-sm border border-purple-50 p-6">
        <h3 className="font-bold text-sm mb-1" style={{ color: '#2e006b' }}>
          ยอดรวมการใช้สาธารณูปโภคทั้งอาคาร
        </h3>
        <p className="text-xs text-gray-500 mb-5">
          สำหรับนำไปเทียบกับบิลใหญ่ของการไฟฟ้าและประปา
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-sky-100 p-4 bg-sky-50/50">
            <div className="flex items-center gap-2 mb-3">
              <Droplets className="w-5 h-5 text-sky-500" />
              <span className="font-semibold text-sky-800 text-sm">น้ำประปารวม</span>
            </div>
            <p className="text-3xl font-bold tabular-nums text-sky-700">
              {util.totalWaterUnits.toLocaleString()}
              <span className="text-sm font-normal text-sky-400 ml-1">หน่วย</span>
            </p>
            <p className="text-sm text-sky-600 mt-1">
              ฿{util.totalWaterAmount.toLocaleString()}
            </p>
            <div className="mt-3 pt-3 border-t border-sky-100 text-xs text-sky-500">
              เฉลี่ย {(util.totalWaterUnits / (48 - 12)).toFixed(1)} หน่วย/ห้อง/เดือน
            </div>
          </div>
          <div className="rounded-xl border border-amber-100 p-4 bg-amber-50/50">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-amber-800 text-sm">ไฟฟ้ารวม</span>
            </div>
            <p className="text-3xl font-bold tabular-nums text-amber-700">
              {util.totalElectricUnits.toLocaleString()}
              <span className="text-sm font-normal text-amber-400 ml-1">หน่วย</span>
            </p>
            <p className="text-sm text-amber-600 mt-1">
              ฿{util.totalElectricAmount.toLocaleString()}
            </p>
            <div className="mt-3 pt-3 border-t border-amber-100 text-xs text-amber-500">
              เฉลี่ย {(util.totalElectricUnits / (48 - 12)).toFixed(1)} หน่วย/ห้อง/เดือน
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ───────────────────────────────────────────
export function ReportsDashboard() {
  const months = useMemo(() => getMonthOptions(), [])
  const [selectedMonth, setSelectedMonth] = useState(months[0].value)

  return (
    <div className="px-4 sm:px-6 py-6 space-y-5 max-w-7xl mx-auto">

      {/* Header + controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="font-bold text-lg" style={{ color: '#2e006b' }}>รายงานสรุปผล</h2>
          <p className="text-xs text-gray-500 mt-0.5">ข้อมูลจากระบบ Mock — เชื่อมต่อ Supabase แล้วจะดึงข้อมูลจริง</p>
        </div>

        {/* Month selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={selectedMonth} onValueChange={(v) => v && setSelectedMonth(v)}>
            <SelectTrigger className="w-44 h-9 text-sm border-purple-200 focus:ring-purple-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Export buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            className="h-9 gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('excel')}
            className="h-9 gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 text-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="revenue">
        <TabsList className="h-9 bg-white border border-purple-100 shadow-sm">
          <TabsTrigger value="revenue" className="text-xs data-[state=active]:bg-purple-900 data-[state=active]:text-white">
            รายรับประจำเดือน
          </TabsTrigger>
          <TabsTrigger value="occupancy" className="text-xs data-[state=active]:bg-purple-900 data-[state=active]:text-white">
            การใช้งานทรัพยากร
          </TabsTrigger>
        </TabsList>

        <div className="mt-5">
          <TabsContent value="revenue">
            <RevenueReport selectedMonth={selectedMonth} />
          </TabsContent>
          <TabsContent value="occupancy">
            <OccupancyReport />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
