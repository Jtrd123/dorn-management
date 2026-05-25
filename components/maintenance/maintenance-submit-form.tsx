'use client'

import { useState } from 'react'
import { Wrench, CheckCircle2, Building2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MOCK_ROOMS } from '@/lib/mock-data'

// ── Categories ────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'ac',        label: '❄️ เครื่องปรับอากาศ' },
  { value: 'water',     label: '🚿 ระบบน้ำ / ท่อน้ำ' },
  { value: 'electric',  label: '⚡ ระบบไฟฟ้า' },
  { value: 'door',      label: '🚪 ประตู / หน้าต่าง' },
  { value: 'furniture', label: '🪑 เฟอร์นิเจอร์ / อุปกรณ์' },
  { value: 'pest',      label: '🐜 แมลง / สัตว์รบกวน' },
  { value: 'other',     label: '🔧 อื่น ๆ' },
]

// ── Success screen ────────────────────────────────────────────
function SuccessScreen({ roomNumber }: { roomNumber: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      style={{ background: '#f5f3ff' }}>
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
        style={{ background: '#ecfdf5', border: '3px solid #6ee7b7' }}>
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
      </div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#2e006b' }}>ส่งคำขอแล้ว!</h1>
      <p className="text-gray-500 text-sm mb-1">ห้อง {roomNumber} — ทีมงานได้รับแจ้งเรียบร้อยแล้ว</p>
      <p className="text-gray-400 text-xs mt-2 max-w-xs">
        เจ้าหน้าที่จะติดต่อกลับหรือเข้าซ่อมภายใน 1–3 วันทำการ
      </p>
      <div className="mt-8 p-4 rounded-2xl border border-dashed border-purple-200 bg-white/80 text-xs text-gray-500 max-w-xs">
        <p className="font-semibold text-gray-600 mb-1">กรณีเร่งด่วน</p>
        <a href="tel:043-123-456" className="text-purple-600 font-medium hover:underline">📞 043-123-456</a>
      </div>
    </div>
  )
}

// ── Main Form ─────────────────────────────────────────────────
export function MaintenanceSubmitForm() {
  const [roomNumber, setRoomNumber] = useState('')
  const [category, setCategory] = useState('')
  const [customTitle, setCustomTitle] = useState('')
  const [description, setDescription] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-fill tenant info when valid room is entered
  function handleRoomChange(val: string) {
    setRoomNumber(val)
    setErrors((e) => ({ ...e, roomNumber: '' }))
    const room = MOCK_ROOMS.find((r) => r.room_number === val.trim())
    if (room?.tenant) {
      setContactName(room.tenant.name)
      setContactPhone(room.tenant.phone)
    } else {
      setContactName('')
      setContactPhone('')
    }
  }

  const matchedRoom = MOCK_ROOMS.find((r) => r.room_number === roomNumber.trim())

  function validate() {
    const e: Record<string, string> = {}
    if (!roomNumber.trim()) e.roomNumber = 'กรุณากรอกหมายเลขห้อง'
    else if (!matchedRoom) e.roomNumber = `ไม่พบห้อง ${roomNumber} ในระบบ`
    else if (matchedRoom.status === 'VACANT') e.roomNumber = 'ห้องนี้ยังไม่มีผู้เช่า'
    if (!category) e.category = 'กรุณาเลือกประเภทปัญหา'
    if (category === 'other' && !customTitle.trim()) e.customTitle = 'กรุณาระบุหัวข้อ'
    if (!contactName.trim()) e.contactName = 'กรุณาระบุชื่อ'
    if (!contactPhone.trim()) e.contactPhone = 'กรุณาระบุเบอร์โทร'
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSubmitted(true)
  }

  if (submitted) return <SuccessScreen roomNumber={roomNumber.trim()} />

  return (
    <div className="min-h-screen" style={{ background: '#f5f3ff' }}>

      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-4 flex items-center gap-3 shadow-sm"
        style={{ background: '#2e006b' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,0.12)' }}>
          <Building2 className="w-5 h-5" style={{ color: '#ffd445' }} />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">หอพักสุขสงบ</p>
          <p className="text-white/65 text-[11px] mt-0.5">แบบฟอร์มแจ้งซ่อม</p>
        </div>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Room number input */}
          <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-4 space-y-2">
            <Label className="text-sm font-bold" style={{ color: '#2e006b' }}>
              หมายเลขห้อง <span className="text-rose-500">*</span>
            </Label>
            <Input
              value={roomNumber}
              onChange={(e) => handleRoomChange(e.target.value)}
              placeholder="เช่น 101, 205, 312"
              maxLength={3}
              className="h-11 text-lg font-bold tracking-widest text-center border-gray-200 focus-visible:ring-1 focus-visible:ring-purple-600"
            />
            {errors.roomNumber && (
              <p className="text-xs text-rose-500">{errors.roomNumber}</p>
            )}
            {/* Show matched room info */}
            {matchedRoom && matchedRoom.status !== 'VACANT' && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <p className="text-xs text-emerald-700 font-medium">
                  ห้อง {matchedRoom.room_number} · ชั้น {matchedRoom.floor} · {matchedRoom.room_type}
                  {matchedRoom.tenant && ` · ${matchedRoom.tenant.name}`}
                </p>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-4 space-y-3">
            <Label className="text-sm font-bold" style={{ color: '#2e006b' }}>
              ประเภทปัญหา <span className="text-rose-500">*</span>
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => { setCategory(cat.value); setErrors((e) => ({ ...e, category: '' })) }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium text-left transition-all
                    ${category === cat.value
                      ? 'border-transparent text-[#2e006b]'
                      : 'border-gray-100 text-gray-700 hover:border-purple-100'}`}
                  style={category === cat.value ? { background: '#f0ebff', borderColor: '#c4b5fd' } : {}}
                >
                  <span>{cat.label}</span>
                  {category === cat.value && (
                    <CheckCircle2 className="w-4 h-4 ml-auto shrink-0" style={{ color: '#7c3aed' }} />
                  )}
                </button>
              ))}
            </div>
            {errors.category && <p className="text-xs text-rose-500">{errors.category}</p>}
          </div>

          {/* Custom title */}
          {category === 'other' && (
            <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-4 space-y-2">
              <Label className="text-sm font-bold" style={{ color: '#2e006b' }}>
                ระบุหัวข้อปัญหา <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={customTitle}
                onChange={(e) => { setCustomTitle(e.target.value); setErrors((err) => ({ ...err, customTitle: '' })) }}
                placeholder="เช่น กลิ่นแก๊สรั่ว, เพดานรั่ว..."
                className="h-10 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-purple-600"
              />
              {errors.customTitle && <p className="text-xs text-rose-500">{errors.customTitle}</p>}
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-4 space-y-2">
            <Label className="text-sm font-bold" style={{ color: '#2e006b' }}>
              รายละเอียดเพิ่มเติม
              <span className="ml-1.5 text-xs font-normal text-gray-400">(ไม่บังคับ)</span>
            </Label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors((err) => ({ ...err, description: '' })) }}
              placeholder="อธิบายอาการ เช่น เกิดขึ้นตั้งแต่เมื่อไร เป็นอย่างไร..."
              rows={4}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 resize-none focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 transition-colors placeholder:text-gray-400"
            />
            {errors.description && <p className="text-xs text-rose-500">{errors.description}</p>}
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-4 space-y-3">
            <Label className="text-sm font-bold" style={{ color: '#2e006b' }}>
              ข้อมูลติดต่อกลับ
            </Label>
            <div className="space-y-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">ชื่อ <span className="text-rose-500">*</span></Label>
                <Input
                  value={contactName}
                  onChange={(e) => { setContactName(e.target.value); setErrors((err) => ({ ...err, contactName: '' })) }}
                  placeholder="ชื่อ-นามสกุล"
                  className="h-10 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-purple-600"
                />
                {errors.contactName && <p className="text-xs text-rose-500">{errors.contactName}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">เบอร์โทรศัพท์ <span className="text-rose-500">*</span></Label>
                <Input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => { setContactPhone(e.target.value); setErrors((err) => ({ ...err, contactPhone: '' })) }}
                  placeholder="08X-XXX-XXXX"
                  className="h-10 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-purple-600"
                />
                {errors.contactPhone && <p className="text-xs text-rose-500">{errors.contactPhone}</p>}
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-100 p-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              กรณีฉุกเฉิน (ไฟไหม้, แก๊สรั่ว, น้ำท่วม) กรุณาโทรแจ้งทันที{' '}
              <a href="tel:043-123-456" className="font-bold underline">043-123-456</a>
            </p>
          </div>

          <Button type="submit" className="w-full h-12 text-base font-bold text-white gap-2"
            style={{ background: '#2e006b' }}>
            <Wrench className="w-5 h-5" />
            ส่งคำขอแจ้งซ่อม
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 pb-4">หอพักสุขสงบ · ระบบแจ้งซ่อมออนไลน์</p>
      </div>
    </div>
  )
}
