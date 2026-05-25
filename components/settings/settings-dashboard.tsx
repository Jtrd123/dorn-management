'use client'

import { useState } from 'react'
import {
  Zap, Droplets, Building2, Users,
  Save, CheckCircle2, History, Eye, EyeOff,
  Home, BadgeDollarSign,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { CURRENT_RATES } from '@/lib/mock-billing-data'
import { getMockSession } from '@/lib/mock-auth'

// ── Types ─────────────────────────────────────────────────────
type SaveState = 'idle' | 'saved'

// ── Rate history (mock) ───────────────────────────────────────
const RATE_HISTORY = [
  { date: '2026-04-01', water: 18, electric: 7, by: 'ผู้ดูแลระบบ' },
  { date: '2025-10-01', water: 16, electric: 6.5, by: 'ผู้ดูแลระบบ' },
  { date: '2025-01-01', water: 15, electric: 6, by: 'ผู้ดูแลระบบ' },
]

// ── Save toast ────────────────────────────────────────────────
function SaveBanner() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
      <CheckCircle2 className="w-4 h-4 shrink-0" />
      บันทึกเรียบร้อยแล้ว
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────
function Section({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5 space-y-4">
      <div>
        <h3 className="font-bold text-sm" style={{ color: '#2e006b' }}>{title}</h3>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <Separator />
      {children}
    </div>
  )
}

// ── Tab: อัตราค่าสาธารณูปโภค ──────────────────────────────────
function UtilityRatesTab() {
  const [water, setWater] = useState(String(CURRENT_RATES.water_unit_price))
  const [electric, setElectric] = useState(String(CURRENT_RATES.electric_unit_price))
  const [saved, setSaved] = useState<SaveState>('idle')

  function handleSave() {
    setSaved('saved')
    setTimeout(() => setSaved('idle'), 3000)
  }

  return (
    <div className="space-y-4">
      <Section
        title="อัตราค่าสาธารณูปโภคปัจจุบัน"
        description="อัตรานี้จะถูก snapshot ลงในทุกบิลที่ออกใหม่ ไม่กระทบบิลเก่า"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Water rate */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-500" />
              ค่าน้ำประปา (บาท/หน่วย)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                step="0.5"
                value={water}
                onChange={(e) => setWater(e.target.value)}
                className="h-10 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-purple-600"
              />
              <span className="text-sm text-gray-500 shrink-0">บาท</span>
            </div>
            <p className="text-[11px] text-gray-400">ปัจจุบัน: ฿{CURRENT_RATES.water_unit_price}/หน่วย</p>
          </div>

          {/* Electric rate */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              ค่าไฟฟ้า (บาท/หน่วย)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                step="0.5"
                value={electric}
                onChange={(e) => setElectric(e.target.value)}
                className="h-10 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-purple-600"
              />
              <span className="text-sm text-gray-500 shrink-0">บาท</span>
            </div>
            <p className="text-[11px] text-gray-400">ปัจจุบัน: ฿{CURRENT_RATES.electric_unit_price}/หน่วย</p>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-600 space-y-1">
          <p className="font-semibold text-gray-700 mb-1.5">ตัวอย่างการคำนวณ (10 หน่วยน้ำ, 150 หน่วยไฟ)</p>
          <div className="flex justify-between">
            <span className="text-sky-600">ค่าน้ำ 10 × ฿{water || '0'}</span>
            <span className="font-medium">฿{((parseFloat(water) || 0) * 10).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-600">ค่าไฟ 150 × ฿{electric || '0'}</span>
            <span className="font-medium">฿{((parseFloat(electric) || 0) * 150).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          {saved === 'saved' ? <SaveBanner /> : <div />}
          <Button onClick={handleSave} className="h-9 gap-2 text-white text-sm font-semibold" style={{ background: '#2e006b' }}>
            <Save className="w-3.5 h-3.5" />
            บันทึกอัตราใหม่
          </Button>
        </div>
      </Section>

      {/* Rate history */}
      <Section title="ประวัติการเปลี่ยนอัตรา" description="บันทึกการแก้ไขย้อนหลัง">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
          <History className="w-3.5 h-3.5" />
          ประวัติล่าสุด 3 รายการ
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[400px]">
            <thead>
              <tr style={{ background: '#faf8ff' }}>
                {['วันที่มีผล', 'ค่าน้ำ', 'ค่าไฟ', 'แก้ไขโดย'].map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RATE_HISTORY.map((r, i) => (
                <tr key={i} className={`border-t border-gray-50 ${i === 0 ? 'font-medium' : ''}`}>
                  <td className="px-3 py-2.5 text-gray-700">
                    {new Date(r.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                    {i === 0 && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: '#ffd445', color: '#2e006b' }}>ปัจจุบัน</span>}
                  </td>
                  <td className="px-3 py-2.5 text-sky-700 tabular-nums">฿{r.water}/หน่วย</td>
                  <td className="px-3 py-2.5 text-amber-700 tabular-nums">฿{r.electric}/หน่วย</td>
                  <td className="px-3 py-2.5 text-gray-500">{r.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  )
}

// ── Tab: ข้อมูลหอพัก ──────────────────────────────────────────
function DormInfoTab() {
  const [form, setForm] = useState({
    name: 'หอพักสุขสงบ',
    address: '123 ถ.สุขสงบ ต.ในเมือง อ.เมือง จ.ขอนแก่น 40000',
    phone: '043-123-456',
    line: '@dormsuksngob',
    tax_id: '0123456789012',
  })
  const [saved, setSaved] = useState<SaveState>('idle')

  function handleSave() {
    setSaved('saved')
    setTimeout(() => setSaved('idle'), 3000)
  }

  const fields: { key: keyof typeof form; label: string; placeholder: string }[] = [
    { key: 'name',    label: 'ชื่อหอพัก',         placeholder: 'หอพักสุขสงบ' },
    { key: 'address', label: 'ที่อยู่',             placeholder: '123 ถ.สุขสงบ ...' },
    { key: 'phone',   label: 'เบอร์โทรติดต่อ',     placeholder: '043-xxx-xxx' },
    { key: 'line',    label: 'Line ID',             placeholder: '@dormsuksngob' },
    { key: 'tax_id',  label: 'เลขประจำตัวผู้เสียภาษี', placeholder: '0123456789012' },
  ]

  return (
    <Section
      title="ข้อมูลหอพัก"
      description="ข้อมูลที่แสดงบนหัวใบเสร็จและเอกสารทุกฉบับ"
    >
      <div className="space-y-3">
        {fields.map(({ key, label, placeholder }) => (
          <div key={key} className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">{label}</Label>
            <Input
              value={form[key]}
              placeholder={placeholder}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="h-10 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-purple-600"
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
        {saved === 'saved' ? <SaveBanner /> : <div />}
        <Button onClick={handleSave} className="h-9 gap-2 text-white text-sm font-semibold" style={{ background: '#2e006b' }}>
          <Save className="w-3.5 h-3.5" />
          บันทึก
        </Button>
      </div>
    </Section>
  )
}

// ── Tab: ราคาห้องพัก ──────────────────────────────────────────
function RoomPricingTab() {
  const [standard, setStandard] = useState('3000')
  const [deluxe, setDeluxe] = useState('4500')
  const [saved, setSaved] = useState<SaveState>('idle')

  function handleSave() {
    setSaved('saved')
    setTimeout(() => setSaved('idle'), 3000)
  }

  return (
    <div className="space-y-4">
      <Section
        title="ราคาค่าเช่าห้องพัก"
        description="กำหนดราคาพื้นฐานตามประเภทห้อง ใช้เป็นค่าเริ่มต้นเมื่อเพิ่มห้องใหม่"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Standard */}
          <div className="rounded-xl border-2 border-purple-100 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f5f0ff' }}>
                <Home className="w-4 h-4" style={{ color: '#7c3aed' }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#2e006b' }}>Standard</p>
                <p className="text-[11px] text-gray-500">ห้องมาตรฐาน (ชั้น 1–3, ห้อง 01–08)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="500"
                step="100"
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                className="h-10 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-purple-600"
              />
              <span className="text-sm text-gray-500 shrink-0">บาท/เดือน</span>
            </div>
          </div>

          {/* Deluxe */}
          <div className="rounded-xl border-2 border-amber-100 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#fefce8' }}>
                <BadgeDollarSign className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">Deluxe</p>
                <p className="text-[11px] text-gray-500">ห้อง Deluxe (ชั้น 1–3, ห้อง 09–16)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="500"
                step="100"
                value={deluxe}
                onChange={(e) => setDeluxe(e.target.value)}
                className="h-10 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-purple-600"
              />
              <span className="text-sm text-gray-500 shrink-0">บาท/เดือน</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-600 flex items-center justify-between flex-wrap gap-2">
          <span>ต่างกัน: <span className="font-semibold text-gray-800">฿{((parseFloat(deluxe) || 0) - (parseFloat(standard) || 0)).toLocaleString()}</span>/เดือน</span>
          <span>รายรับสูงสุด/เดือน (48 ห้อง เต็ม):
            <span className="font-semibold text-gray-800 ml-1">
              ฿{((parseFloat(standard) || 0) * 24 + (parseFloat(deluxe) || 0) * 24).toLocaleString()}
            </span>
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          {saved === 'saved' ? <SaveBanner /> : <div />}
          <Button onClick={handleSave} className="h-9 gap-2 text-white text-sm font-semibold" style={{ background: '#2e006b' }}>
            <Save className="w-3.5 h-3.5" />
            บันทึกราคา
          </Button>
        </div>
      </Section>

      <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/50 p-4 text-xs text-amber-700 space-y-1">
        <p className="font-semibold">⚠️ หมายเหตุ</p>
        <p>การเปลี่ยนราคาจะมีผลกับห้องที่ยังว่างเท่านั้น ห้องที่มีผู้เช่าอยู่จะยังคงราคาเดิมจนกว่าจะต่อสัญญาใหม่</p>
      </div>
    </div>
  )
}

// ── Tab: จัดการผู้ใช้งาน ──────────────────────────────────────
function UserManagementTab() {
  const session = typeof window !== 'undefined' ? getMockSession() : null

  const [name, setName] = useState(session?.name ?? 'ผู้ดูแลระบบ')
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [nameSaved, setNameSaved] = useState<SaveState>('idle')
  const [pwSaved, setPwSaved] = useState<SaveState>('idle')
  const [pwError, setPwError] = useState('')

  function handleSaveName() {
    setNameSaved('saved')
    setTimeout(() => setNameSaved('idle'), 3000)
  }

  function handleSavePw() {
    setPwError('')
    if (!pwForm.current) { setPwError('กรุณากรอกรหัสผ่านปัจจุบัน'); return }
    if (pwForm.newPw.length < 6) { setPwError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'); return }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('รหัสผ่านใหม่ไม่ตรงกัน'); return }
    setPwForm({ current: '', newPw: '', confirm: '' })
    setPwSaved('saved')
    setTimeout(() => setPwSaved('idle'), 3000)
  }

  return (
    <div className="space-y-4">
      {/* Profile */}
      <Section title="ข้อมูลผู้ใช้งาน" description="แก้ไขชื่อที่แสดงใน sidebar">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">ชื่อที่แสดง</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-purple-600"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">บทบาท</Label>
          <div className="h-10 px-3 flex items-center rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-600">
            <span className="px-2 py-0.5 rounded-full text-xs font-bold mr-2" style={{ background: '#ffd445', color: '#2e006b' }}>
              {session?.role ?? 'ADMIN'}
            </span>
            ไม่สามารถแก้ไขได้
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {nameSaved === 'saved' ? <SaveBanner /> : <div />}
          <Button onClick={handleSaveName} className="h-9 gap-2 text-white text-sm font-semibold" style={{ background: '#2e006b' }}>
            <Save className="w-3.5 h-3.5" />
            บันทึกชื่อ
          </Button>
        </div>
      </Section>

      {/* Change password */}
      <Section title="เปลี่ยนรหัสผ่าน">
        <div className="space-y-3">
          {[
            { key: 'current', label: 'รหัสผ่านปัจจุบัน' },
            { key: 'newPw',   label: 'รหัสผ่านใหม่' },
            { key: 'confirm', label: 'ยืนยันรหัสผ่านใหม่' },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">{label}</Label>
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={pwForm[key as keyof typeof pwForm]}
                  onChange={(e) => setPwForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="h-10 pr-10 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-purple-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          {pwError && (
            <p className="text-xs text-rose-600 font-medium">{pwError}</p>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
          {pwSaved === 'saved' ? <SaveBanner /> : <div />}
          <Button onClick={handleSavePw} className="h-9 gap-2 text-white text-sm font-semibold" style={{ background: '#2e006b' }}>
            <Save className="w-3.5 h-3.5" />
            เปลี่ยนรหัสผ่าน
          </Button>
        </div>
      </Section>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────
export function SettingsDashboard() {
  return (
    <div className="px-4 sm:px-6 py-6 space-y-5 max-w-3xl mx-auto">
      <div>
        <h2 className="font-bold text-lg" style={{ color: '#2e006b' }}>ตั้งค่าระบบ</h2>
        <p className="text-xs text-gray-500 mt-0.5">การเปลี่ยนแปลงที่นี่จะมีผลเมื่อเชื่อมต่อ Supabase แล้ว</p>
      </div>

      <Tabs defaultValue="rates">
        <TabsList className="bg-white border border-purple-100 p-1 rounded-xl h-auto flex-wrap gap-1">
          <TabsTrigger value="rates" className="rounded-lg text-xs font-semibold data-[state=active]:text-white gap-1.5" style={{ '--tw-shadow': 'none' } as React.CSSProperties}>
            <Droplets className="w-3.5 h-3.5" />
            อัตราน้ำ/ไฟ
          </TabsTrigger>
          <TabsTrigger value="dorm" className="rounded-lg text-xs font-semibold gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            ข้อมูลหอพัก
          </TabsTrigger>
          <TabsTrigger value="pricing" className="rounded-lg text-xs font-semibold gap-1.5">
            <Home className="w-3.5 h-3.5" />
            ราคาห้องพัก
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg text-xs font-semibold gap-1.5">
            <Users className="w-3.5 h-3.5" />
            ผู้ใช้งาน
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rates"   className="mt-4"><UtilityRatesTab /></TabsContent>
        <TabsContent value="dorm"    className="mt-4"><DormInfoTab /></TabsContent>
        <TabsContent value="pricing" className="mt-4"><RoomPricingTab /></TabsContent>
        <TabsContent value="users"   className="mt-4"><UserManagementTab /></TabsContent>
      </Tabs>
    </div>
  )
}
