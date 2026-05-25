'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, FileText, Droplets, Zap,
  CheckCircle2, Clock, AlertCircle,
  ThumbsUp, Banknote, Receipt, Home,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getMockBillByRoom, formatThaiMonth, type BillRecord, type BillStatus } from '@/lib/mock-bills-data'
import { getRoomBillingData } from '@/lib/mock-billing-data'

// ── Status config ─────────────────────────────────────────────
const STATUS_META: Record<BillStatus, { label: string; style: string; icon: React.ElementType }> = {
  PENDING_APPROVAL: { label: 'รออนุมัติ', style: 'bg-sky-50 text-sky-700 border-sky-200',              icon: Clock },
  UNPAID:           { label: 'ค้างชำระ',  style: 'bg-rose-50 text-rose-700 border-rose-200',           icon: AlertCircle },
  PAID:             { label: 'ชำระแล้ว',  style: 'bg-emerald-50 text-emerald-700 border-emerald-200',  icon: CheckCircle2 },
}

const HIST_STATUS_META: Record<string, { label: string; style: string }> = {
  PENDING_APPROVAL: { label: 'รออนุมัติ', style: 'text-sky-600' },
  UNPAID:           { label: 'ค้างชำระ',  style: 'text-rose-600 font-semibold' },
  PAID:             { label: 'ชำระแล้ว',  style: 'text-emerald-600' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ── Bill breakdown card ───────────────────────────────────────
function BillBreakdown({ bill }: { bill: BillRecord }) {
  return (
    <div className="bg-white rounded-2xl border border-purple-50 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" style={{ color: '#2e006b' }} />
          <span className="font-bold text-sm" style={{ color: '#2e006b' }}>
            บิลประจำเดือน {formatThaiMonth(bill.billing_month)}
          </span>
        </div>
        {(() => {
          const meta = STATUS_META[bill.status]
          const Icon = meta.icon
          return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.style}`}>
              <Icon className="w-3 h-3 shrink-0" />
              {meta.label}
            </span>
          )
        })()}
      </div>

      <div className="p-5 space-y-3">
        {/* Room rent */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Home className="w-4 h-4 text-gray-400" />
            ค่าเช่าห้อง ({bill.room_type})
          </div>
          <span className="font-semibold text-gray-800 tabular-nums">฿{bill.room_price.toLocaleString()}</span>
        </div>

        {/* Water */}
        <div className="rounded-xl bg-sky-50/60 border border-sky-100 p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-sky-700 font-medium">
              <Droplets className="w-4 h-4" />
              ค่าน้ำ
            </div>
            <span className="font-bold text-sky-700 tabular-nums">฿{bill.water_amount.toLocaleString()}</span>
          </div>
          <div className="text-xs text-sky-600 space-y-0.5">
            <div className="flex justify-between">
              <span>เลขมิเตอร์ก่อนหน้า</span>
              <span className="tabular-nums">{bill.water_previous}</span>
            </div>
            <div className="flex justify-between">
              <span>เลขมิเตอร์ปัจจุบัน</span>
              <span className="tabular-nums">{bill.water_current}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>จำนวนหน่วย × ราคา</span>
              <span className="tabular-nums">{bill.water_units} × ฿{bill.water_unit_price}</span>
            </div>
          </div>
        </div>

        {/* Electric */}
        <div className="rounded-xl bg-amber-50/60 border border-amber-100 p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-amber-700 font-medium">
              <Zap className="w-4 h-4" />
              ค่าไฟ
            </div>
            <span className="font-bold text-amber-700 tabular-nums">฿{bill.electric_amount.toLocaleString()}</span>
          </div>
          <div className="text-xs text-amber-600 space-y-0.5">
            <div className="flex justify-between">
              <span>เลขมิเตอร์ก่อนหน้า</span>
              <span className="tabular-nums">{bill.electric_previous}</span>
            </div>
            <div className="flex justify-between">
              <span>เลขมิเตอร์ปัจจุบัน</span>
              <span className="tabular-nums">{bill.electric_current}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>จำนวนหน่วย × ราคา</span>
              <span className="tabular-nums">{bill.electric_units} × ฿{bill.electric_unit_price}</span>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="border-t pt-3 flex items-center justify-between">
          <span className="font-bold text-sm" style={{ color: '#2e006b' }}>ยอดรวมทั้งหมด</span>
          <span className="text-2xl font-bold tabular-nums" style={{ color: '#2e006b' }}>
            ฿{bill.total_amount.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────
export function RoomBillDetail({ roomNumber }: { roomNumber: string }) {
  const initial = getMockBillByRoom(roomNumber)
  const history = getRoomBillingData(roomNumber)

  const [bill, setBill] = useState<BillRecord | null>(initial)

  if (!bill) {
    return (
      <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto text-center py-20">
        <p className="text-gray-400 text-sm">ไม่พบข้อมูลบิลสำหรับห้อง {roomNumber}</p>
        <Link href="/bills" className="text-purple-600 text-sm hover:underline mt-2 inline-block">← กลับ</Link>
      </div>
    )
  }

  function handleApprove() {
    setBill((b) => b ? { ...b, status: 'UNPAID' } : b)
  }

  function handleMarkPaid() {
    setBill((b) => b ? { ...b, status: 'PAID' } : b)
  }

  return (
    <div className="px-4 sm:px-6 py-6 space-y-5 max-w-2xl mx-auto">

      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Link href="/bills">
          <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h2 className="font-bold text-lg leading-none" style={{ color: '#2e006b' }}>
            ห้อง {roomNumber}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">{bill.tenant_name} · {bill.tenant_phone}</p>
        </div>
      </div>

      {/* Current bill */}
      <BillBreakdown bill={bill} />

      {/* Action buttons */}
      <div className="space-y-2">
        {bill.status === 'PENDING_APPROVAL' && (
          <Button
            onClick={handleApprove}
            className="w-full h-11 font-semibold text-white gap-2"
            style={{ background: '#2e006b' }}
          >
            <ThumbsUp className="w-4 h-4" />
            อนุมัติบิล — ส่งให้ผู้เช่าชำระ
          </Button>
        )}
        {bill.status === 'UNPAID' && (
          <Button
            onClick={handleMarkPaid}
            className="w-full h-11 font-semibold text-white gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <Banknote className="w-4 h-4" />
            บันทึกการรับชำระเงิน
          </Button>
        )}
        {bill.status === 'PAID' && (
          <Link href={`/receipt/${roomNumber}`}>
            <Button className="w-full h-11 font-semibold gap-2" variant="outline"
              style={{ borderColor: '#2e006b', color: '#2e006b' }}>
              <Receipt className="w-4 h-4" />
              พิมพ์ใบเสร็จ
            </Button>
          </Link>
        )}
        <Link href={`/meter/${roomNumber}`}>
          <Button variant="outline" className="w-full h-9 text-sm gap-2 border-gray-200 text-gray-600 hover:bg-gray-50">
            <Zap className="w-3.5 h-3.5" style={{ color: '#2e006b' }} />
            บันทึกเลขมิเตอร์เดือนถัดไป
          </Button>
        </Link>
      </div>

      {/* Billing history */}
      <div className="bg-white rounded-2xl border border-purple-50 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <span className="font-bold text-sm" style={{ color: '#2e006b' }}>ประวัติบิลย้อนหลัง</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr style={{ background: '#faf8ff' }}>
                {['เดือน', 'ค่าห้อง', 'ค่าน้ำ', 'ค่าไฟ', 'รวม', 'สถานะ'].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.history.slice().reverse().map((row, i) => {
                const hs = HIST_STATUS_META[row.status] ?? { label: row.status, style: 'text-gray-500' }
                return (
                  <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-2.5 text-gray-700">{formatThaiMonth(row.billing_month)}</td>
                    <td className="px-4 py-2.5 tabular-nums text-gray-600">{row.room_price.toLocaleString()}</td>
                    <td className="px-4 py-2.5 tabular-nums text-sky-700">
                      {(row.water_current - row.water_previous) * row.water_unit_price}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-amber-700">
                      {(row.electric_current - row.electric_previous) * row.electric_unit_price}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums font-semibold" style={{ color: '#2e006b' }}>
                      ฿{row.total_amount.toLocaleString()}
                    </td>
                    <td className={`px-4 py-2.5 text-xs ${hs.style}`}>{hs.label}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
