'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Building2, User, Droplets, Zap,
  AlertTriangle, CheckCircle2, Info, TrendingUp,
  TrendingDown, Clock, ShieldCheck, Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { getMockSession } from '@/lib/mock-auth'
import {
  getRoomBillingData, CURRENT_RATES,
  formatThaiMonth, currentBillingMonth,
  type MonthlyReading,
} from '@/lib/mock-billing-data'

// ── Sub-components ───────────────────────────────────────────

function SectionTitle({ icon: Icon, title, sub }: {
  icon: React.ElementType; title: string; sub?: string
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#2e006b15' }}>
        <Icon className="w-3.5 h-3.5" style={{ color: '#2e006b' }} />
      </div>
      <div>
        <p className="text-sm font-bold" style={{ color: '#2e006b' }}>{title}</p>
        {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
      </div>
    </div>
  )
}

function ReadOnlyMeter({ label, value, icon: Icon, color }: {
  label: string; value: number; icon: React.ElementType; color: string
}) {
  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl border bg-gray-50">
      <div className="flex items-center gap-2.5">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="font-bold tabular-nums text-gray-800">
        {value.toLocaleString()} <span className="text-xs font-normal text-gray-500">หน่วย</span>
      </span>
    </div>
  )
}

function AnomalyBadge({ units, avg, label }: { units: number; avg: number; label: string }) {
  if (units <= 0 || avg <= 0) return null

  const pct = Math.round(((units - avg) / avg) * 100)
  const isHigh = units > avg * 1.5
  const isLow = units < avg * 0.5

  if (!isHigh && !isLow) return null

  const Icon = isHigh ? TrendingUp : TrendingDown

  return (
    <div className="flex items-start gap-2 mt-2 p-3 rounded-lg bg-red-50 border border-red-200">
      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-bold text-red-700">
          ⚠ {label}{isHigh ? 'สูง' : 'ต่ำ'}กว่าค่าเฉลี่ยผิดปกติ
        </p>
        <p className="text-xs text-red-600 mt-0.5">
          ใช้ {units} หน่วย vs เฉลี่ย {avg.toFixed(1)} หน่วย
          <span className="font-bold ml-1">
            ({isHigh ? '+' : ''}{pct}%)
          </span>
          — กรุณาตรวจสอบความถูกต้องก่อนบันทึก
        </p>
        <div className="flex items-center gap-1 mt-1 text-[10px] text-red-400">
          <Icon className="w-3 h-3" />
          เกณฑ์แจ้งเตือน: เบี่ยงเกิน ±50% จากค่าเฉลี่ย 3 เดือนย้อนหลัง
        </div>
      </div>
    </div>
  )
}

function BillRow({ label, amount, sub, highlight }: {
  label: string; amount: number; sub?: string; highlight?: boolean
}) {
  return (
    <div className={`flex items-center justify-between py-1.5 ${highlight ? 'font-bold' : ''}`}>
      <div>
        <span className={`text-sm ${highlight ? 'text-gray-900' : 'text-gray-600'}`}>{label}</span>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <span
        className={`tabular-nums text-sm ${highlight ? 'text-lg' : ''}`}
        style={{ color: highlight ? '#2e006b' : undefined }}
      >
        {amount.toLocaleString()} <span className="text-xs font-normal text-gray-500">บาท</span>
      </span>
    </div>
  )
}

function HistoryTable({ history }: { history: MonthlyReading[] }) {
  const last3 = history.slice(-3)
  return (
    <div className="rounded-xl border overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr style={{ background: '#f5f3ff' }}>
            <th className="text-left px-3 py-2 text-gray-500 font-medium">เดือน</th>
            <th className="text-right px-3 py-2 text-gray-500 font-medium">น้ำ (หน่วย)</th>
            <th className="text-right px-3 py-2 text-gray-500 font-medium">ไฟ (หน่วย)</th>
            <th className="text-right px-3 py-2 text-gray-500 font-medium">รวม (บาท)</th>
          </tr>
        </thead>
        <tbody>
          {last3.map((m, i) => {
            const wUnits = m.water_current - m.water_previous
            const eUnits = m.electric_current - m.electric_previous
            return (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="px-3 py-2 text-gray-700">{formatThaiMonth(m.billing_month)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-blue-700">{wUnits}</td>
                <td className="px-3 py-2 text-right tabular-nums text-amber-700">{eUnits}</td>
                <td className="px-3 py-2 text-right tabular-nums font-medium text-gray-800">
                  {m.total_amount.toLocaleString()}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Success state ────────────────────────────────────────────
function SuccessScreen({
  roomNumber, billingMonth, totalAmount, status, onBack,
}: {
  roomNumber: string; billingMonth: string; totalAmount: number
  status: 'UNPAID' | 'PENDING_APPROVAL'; onBack: () => void
}) {
  const isAdmin = status === 'UNPAID'
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      <div className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: isAdmin ? '#f0fdf4' : '#fefce8' }}>
        {isAdmin
          ? <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          : <Clock className="w-10 h-10 text-yellow-500" />}
      </div>
      <div>
        <h2 className="text-xl font-bold" style={{ color: '#2e006b' }}>
          {isAdmin ? 'ออกบิลสำเร็จ' : 'ส่งข้อมูลเรียบร้อย'}
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          ห้อง {roomNumber} · {formatThaiMonth(billingMonth)}
        </p>
      </div>
      <div className="bg-white border rounded-2xl p-6 w-full max-w-xs shadow-sm">
        <p className="text-3xl font-bold" style={{ color: '#2e006b' }}>
          {totalAmount.toLocaleString()}
          <span className="text-base font-normal text-gray-400 ml-1">บาท</span>
        </p>
        <div className="mt-3 flex justify-center">
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold border"
            style={isAdmin
              ? { background: '#fff1f2', color: '#9f1239', borderColor: '#fecdd3' }
              : { background: '#fefce8', color: '#713f12', borderColor: '#fde047' }}
          >
            {isAdmin ? 'UNPAID — รอชำระเงิน' : 'PENDING_APPROVAL — รอ Admin ยืนยัน'}
          </span>
        </div>
      </div>
      <Button onClick={onBack} variant="outline" className="mt-2">
        <ArrowLeft className="w-4 h-4 mr-2" />
        กลับหน้า Dashboard
      </Button>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────
export function UtilityForm({ roomNumber }: { roomNumber: string }) {
  const router = useRouter()
  const session = getMockSession()
  const role = session?.role ?? 'TENANT'

  const billing = getRoomBillingData(roomNumber)
  const billingMonth = currentBillingMonth()

  const lastReading = billing.history[billing.history.length - 1]
  const last3 = billing.history.slice(-3)

  // 3-month averages for anomaly detection
  const avgWaterUnits = last3.reduce((s, m) => s + (m.water_current - m.water_previous), 0) / last3.length
  const avgElectricUnits = last3.reduce((s, m) => s + (m.electric_current - m.electric_previous), 0) / last3.length

  const [waterCurrent, setWaterCurrent] = useState('')
  const [electricCurrent, setElectricCurrent] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const water = useMemo(() => {
    const val = parseFloat(waterCurrent)
    if (isNaN(val) || waterCurrent === '') return null
    return val
  }, [waterCurrent])

  const electric = useMemo(() => {
    const val = parseFloat(electricCurrent)
    if (isNaN(val) || electricCurrent === '') return null
    return val
  }, [electricCurrent])

  const waterUnits = water !== null ? water - lastReading.water_current : 0
  const electricUnits = electric !== null ? electric - lastReading.electric_current : 0

  // ── Validation ──
  const waterHardError = water !== null && water < lastReading.water_current
    ? `ต้องไม่น้อยกว่าเดือนก่อน (${lastReading.water_current.toLocaleString()})`
    : null

  const electricHardError = electric !== null && electric < lastReading.electric_current
    ? `ต้องไม่น้อยกว่าเดือนก่อน (${lastReading.electric_current.toLocaleString()})`
    : null

  // ── Anomaly flags ──
  const waterAnomaly = water !== null && !waterHardError && waterUnits > 0 &&
    (waterUnits > avgWaterUnits * 1.5 || waterUnits < avgWaterUnits * 0.5)

  const electricAnomaly = electric !== null && !electricHardError && electricUnits > 0 &&
    (electricUnits > avgElectricUnits * 1.5 || electricUnits < avgElectricUnits * 0.5)

  // ── Bill calculation ──
  const waterAmt = Math.max(0, waterUnits) * CURRENT_RATES.water_unit_price
  const electricAmt = Math.max(0, electricUnits) * CURRENT_RATES.electric_unit_price
  const totalAmount = billing.base_price + waterAmt + electricAmt

  const canSubmit =
    water !== null && electric !== null &&
    !waterHardError && !electricHardError &&
    waterUnits >= 0 && electricUnits >= 0

  const billStatus = role === 'ADMIN' ? 'UNPAID' : 'PENDING_APPROVAL'

  function handleSubmit() {
    if (!canSubmit) return
    // Mock payload — replace with Supabase insert later
    console.log('[Mock Submit]', {
      room_number: roomNumber,
      billing_month: billingMonth,
      water_previous: lastReading.water_current,
      water_current: water,
      water_unit_price: CURRENT_RATES.water_unit_price,   // snapshot
      electric_previous: lastReading.electric_current,
      electric_current: electric,
      electric_unit_price: CURRENT_RATES.electric_unit_price,  // snapshot
      total_amount: totalAmount,
      status: billStatus,
      recorded_by: session?.name,
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <SuccessScreen
          roomNumber={roomNumber}
          billingMonth={billingMonth}
          totalAmount={totalAmount}
          status={billStatus}
          onBack={() => router.push('/dashboard')}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#f5f3ff' }}>

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-20 shadow-md" style={{ background: '#2e006b' }}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Building2 className="w-5 h-5" style={{ color: '#ffd445' }} />
          <div className="flex-1">
            <p className="text-white font-bold text-sm leading-none">จดมิเตอร์น้ำ-ไฟ</p>
            <p className="text-white/50 text-xs mt-0.5">ห้อง {roomNumber} · {formatThaiMonth(billingMonth)}</p>
          </div>
          {/* Role badge */}
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0"
            style={{ background: '#ffd445', color: '#2e006b' }}
          >
            {role}
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {/* ── Room Info Card ── */}
        <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#2e006b' }}>
              <Building2 className="w-5 h-5" style={{ color: '#ffd445' }} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-base" style={{ color: '#2e006b' }}>ห้อง {roomNumber}</p>
              <p className="text-xs text-gray-500">ชั้น {billing.floor} · {billing.room_type} · {billing.base_price.toLocaleString()} บาท/เดือน</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4 text-gray-400" />
            {billing.tenant_name}
          </div>
        </div>

        {/* ── Role notice ── */}
        <div
          className="rounded-xl border p-3.5 flex items-start gap-3"
          style={role === 'ADMIN'
            ? { background: '#f5f0ff', borderColor: '#c4b5fd' }
            : { background: '#fefce8', borderColor: '#fde047' }}
        >
          {role === 'ADMIN'
            ? <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7c3aed' }} />
            : <Send className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#d97706' }} />}
          <div>
            <p className="text-xs font-bold" style={{ color: role === 'ADMIN' ? '#3b0764' : '#713f12' }}>
              {role === 'ADMIN'
                ? 'Admin Mode — บิลจะออกสถานะ UNPAID ทันที'
                : 'Tenant Mode — ข้อมูลจะส่งรอ Admin ยืนยัน (PENDING_APPROVAL)'}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: role === 'ADMIN' ? '#6d28d9' : '#92400e' }}>
              {role === 'ADMIN'
                ? 'ราคาต่อหน่วย ณ วันนี้จะถูก Snapshot ลงในบิลนี้ทันที'
                : 'Admin จะตรวจสอบตัวเลขและยืนยันก่อนออกบิลจริง'}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">

          {/* ── Left column ── */}
          <div className="space-y-4">

            {/* Previous readings */}
            <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5">
              <SectionTitle
                icon={Info}
                title="เลขมิเตอร์เดือนก่อน"
                sub={`อ้างอิง: ${formatThaiMonth(lastReading.billing_month)}`}
              />
              <div className="space-y-2">
                <ReadOnlyMeter
                  label="มิเตอร์น้ำ (ก่อน)"
                  value={lastReading.water_current}
                  icon={Droplets}
                  color="#0ea5e9"
                />
                <ReadOnlyMeter
                  label="มิเตอร์ไฟ (ก่อน)"
                  value={lastReading.electric_current}
                  icon={Zap}
                  color="#f59e0b"
                />
              </div>
            </div>

            {/* Current readings input */}
            <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5">
              <SectionTitle
                icon={Zap}
                title="กรอกเลขมิเตอร์เดือนนี้"
                sub={formatThaiMonth(billingMonth)}
              />
              <div className="space-y-4">

                {/* Water */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-sky-400" />
                    เลขมิเตอร์น้ำ
                    <span className="text-[10px] text-gray-400 font-normal ml-1">
                      (ต้องมากกว่า {lastReading.water_current.toLocaleString()})
                    </span>
                  </Label>
                  <Input
                    type="number"
                    placeholder={`เช่น ${lastReading.water_current + 10}`}
                    value={waterCurrent}
                    onChange={(e) => setWaterCurrent(e.target.value)}
                    min={lastReading.water_current}
                    step="1"
                    className={`h-11 tabular-nums ${waterHardError ? 'border-red-400 focus-visible:ring-red-400' : 'focus-visible:ring-purple-700'}`}
                  />
                  {waterHardError && (
                    <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {waterHardError}
                    </p>
                  )}
                  {waterAnomaly && (
                    <AnomalyBadge units={waterUnits} avg={avgWaterUnits} label="ค่าน้ำ" />
                  )}
                </div>

                {/* Electric */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    เลขมิเตอร์ไฟ
                    <span className="text-[10px] text-gray-400 font-normal ml-1">
                      (ต้องมากกว่า {lastReading.electric_current.toLocaleString()})
                    </span>
                  </Label>
                  <Input
                    type="number"
                    placeholder={`เช่น ${lastReading.electric_current + 150}`}
                    value={electricCurrent}
                    onChange={(e) => setElectricCurrent(e.target.value)}
                    min={lastReading.electric_current}
                    step="1"
                    className={`h-11 tabular-nums ${electricHardError ? 'border-red-400 focus-visible:ring-red-400' : 'focus-visible:ring-purple-700'}`}
                  />
                  {electricHardError && (
                    <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {electricHardError}
                    </p>
                  )}
                  {electricAnomaly && (
                    <AnomalyBadge units={electricUnits} avg={avgElectricUnits} label="ค่าไฟ" />
                  )}
                </div>

              </div>
            </div>

            {/* History table */}
            <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5">
              <button
                onClick={() => setShowHistory((v) => !v)}
                className="w-full flex items-center justify-between text-sm font-bold mb-1"
                style={{ color: '#2e006b' }}
              >
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  ประวัติการใช้งาน 3 เดือนย้อนหลัง
                </span>
                <span className="text-xs text-gray-400 font-normal">
                  {showHistory ? 'ซ่อน ▲' : 'แสดง ▼'}
                </span>
              </button>
              {showHistory && (
                <div className="mt-3">
                  <HistoryTable history={billing.history} />
                  <div className="mt-2 flex gap-4 text-xs text-gray-500 px-1">
                    <span>เฉลี่ยน้ำ: <b>{avgWaterUnits.toFixed(1)}</b> หน่วย/เดือน</span>
                    <span>เฉลี่ยไฟ: <b>{avgElectricUnits.toFixed(1)}</b> หน่วย/เดือน</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right column: Bill summary ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5 sticky top-20">
              <SectionTitle icon={CheckCircle2} title="สรุปบิลประจำเดือน" sub={formatThaiMonth(billingMonth)} />

              {/* Usage summary */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50 border border-sky-100">
                  <div className="flex items-center gap-2 text-sm text-sky-700">
                    <Droplets className="w-4 h-4" />
                    หน่วยน้ำที่ใช้
                  </div>
                  <div className="text-right">
                    <p className="font-bold tabular-nums text-sky-800">
                      {water !== null && !waterHardError ? waterUnits : '–'} หน่วย
                    </p>
                    <p className="text-[10px] text-sky-400">
                      เฉลี่ย {avgWaterUnits.toFixed(1)} หน่วย/เดือน
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <Zap className="w-4 h-4" />
                    หน่วยไฟที่ใช้
                  </div>
                  <div className="text-right">
                    <p className="font-bold tabular-nums text-amber-800">
                      {electric !== null && !electricHardError ? electricUnits : '–'} หน่วย
                    </p>
                    <p className="text-[10px] text-amber-400">
                      เฉลี่ย {avgElectricUnits.toFixed(1)} หน่วย/เดือน
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Bill breakdown */}
              <div className="space-y-1">
                <BillRow
                  label="ค่าห้อง"
                  amount={billing.base_price}
                  sub={`${billing.room_type} · ${billing.base_price.toLocaleString()} บาท`}
                />
                <BillRow
                  label="ค่าน้ำ"
                  amount={waterAmt}
                  sub={water !== null && !waterHardError
                    ? `${waterUnits} หน่วย × ${CURRENT_RATES.water_unit_price} บาท`
                    : 'รอกรอกเลขมิเตอร์'}
                />
                <BillRow
                  label="ค่าไฟ"
                  amount={electricAmt}
                  sub={electric !== null && !electricHardError
                    ? `${electricUnits} หน่วย × ${CURRENT_RATES.electric_unit_price} บาท`
                    : 'รอกรอกเลขมิเตอร์'}
                />
              </div>

              <div className="h-px bg-gray-100 my-3" />

              <BillRow
                label="รวมทั้งหมด"
                amount={totalAmount}
                highlight
              />

              {/* Rate snapshot notice */}
              <div className="mt-4 p-3 rounded-lg border border-dashed border-gray-200 bg-gray-50">
                <p className="text-[11px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Rate Snapshot (บันทึก ณ วันที่กรอก)
                </p>
                <p className="text-[11px] text-gray-400">
                  น้ำ: <b className="text-gray-600">{CURRENT_RATES.water_unit_price} บ./หน่วย</b>
                  &ensp;|&ensp;
                  ไฟ: <b className="text-gray-600">{CURRENT_RATES.electric_unit_price} บ./หน่วย</b>
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  อัปเดตล่าสุด: {CURRENT_RATES.updated_at} โดย {CURRENT_RATES.updated_by}
                </p>
              </div>

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full h-12 text-base font-bold text-white mt-4 transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ background: canSubmit ? '#2e006b' : undefined }}
              >
                {role === 'ADMIN' ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    ออกบิล — UNPAID
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    ส่งรอ Admin ยืนยัน
                  </span>
                )}
              </Button>

              {!canSubmit && water !== null && electric !== null && (
                <p className="text-center text-xs text-red-500 mt-2">
                  กรุณาแก้ไขข้อผิดพลาดก่อนบันทึก
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
