'use client'

import { useState, useMemo } from 'react'
import {
  Wrench, CheckCircle2, Clock, AlertTriangle,
  ChevronDown, User, Phone, Filter,
  QrCode, Copy, Check, ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  getMockMaintenanceItems,
  getMaintenanceStats,
  type MaintenanceItem,
  type MaintenanceStatus,
} from '@/lib/mock-maintenance-data'

// ── Helpers ───────────────────────────────────────────────────
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  const mins = Math.floor(diff / 60000)
  if (days >= 1) return `${days} วันที่แล้ว`
  if (hours >= 1) return `${hours} ชม.ที่แล้ว`
  return `${mins} นาทีที่แล้ว`
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, bg }: {
  label: string; value: number; icon: React.ElementType
  color: string; bg: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-4 flex items-center gap-4">
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

// ── Filter pill ───────────────────────────────────────────────
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

// ── Maintenance Card ──────────────────────────────────────────
function MaintenanceCard({
  item,
  onResolve,
}: {
  item: MaintenanceItem
  onResolve: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const isPending = item.status === 'PENDING'

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all
      ${isPending ? 'border-yellow-200' : 'border-gray-100'}`}>

      {/* Card header */}
      <div className="p-4">
        <div className="flex items-start gap-3">

          {/* Status icon */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5
            ${isPending ? 'bg-yellow-50' : 'bg-emerald-50'}`}>
            {isPending
              ? <Wrench className="w-4 h-4 text-yellow-600" />
              : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm" style={{ color: '#2e006b' }}>
                    ห้อง {item.room_number}
                  </span>
                  <span className="text-xs text-gray-500">ชั้น {item.floor} · {item.room_type}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border
                    ${isPending
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                    {isPending ? 'รอดำเนินการ' : 'แก้ไขแล้ว'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-800 mt-1 leading-snug">
                  {item.title}
                </p>
              </div>
            </div>

            {/* Tenant row */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <User className="w-3 h-3" />
                {item.tenant_name}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Phone className="w-3 h-3" />
                {item.tenant_phone}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {timeAgo(item.submitted_at)}
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
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-50 px-4 pb-4 pt-3 space-y-3">
          {/* Description */}
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs font-semibold text-gray-500 mb-1">รายละเอียด</p>
            <p className="text-sm text-gray-700">{item.description}</p>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
              <span>แจ้งเมื่อ: <span className="text-gray-700 font-medium">{formatDateTime(item.submitted_at)}</span></span>
            </div>
            {item.resolved_at && (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>แก้ไขเมื่อ: <span className="text-gray-700 font-medium">{formatDateTime(item.resolved_at)}</span></span>
              </div>
            )}
          </div>

          {/* Resolve note */}
          {item.resolved_note && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
              <p className="text-xs font-semibold text-emerald-700 mb-1">บันทึกการแก้ไข</p>
              <p className="text-sm text-emerald-800">{item.resolved_note}</p>
            </div>
          )}

          {/* Action button */}
          {isPending && (
            <Button
              onClick={() => onResolve(item.id)}
              className="w-full h-10 font-semibold text-white mt-1"
              style={{ background: '#2e006b' }}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              แก้ไขเสร็จแล้ว — เปลี่ยนสถานะเป็นปกติ
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// ── QR Link Dialog ────────────────────────────────────────────
function QrDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const submitUrl = `${baseUrl}/submit`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(submitUrl)}`

  function handleCopy() {
    navigator.clipboard.writeText(submitUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-bold" style={{ color: '#2e006b' }}>
            QR แจ้งซ่อมสำหรับผู้เช่า
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            ผู้เช่า scan QR หรือเปิดลิงก์ แล้วกรอกหมายเลขห้องได้เลย — ไม่ต้อง login
          </p>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl border-2 border-purple-100 bg-white inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="QR Code" width={180} height={180} className="rounded-lg" />
            </div>
          </div>

          {/* URL + actions */}
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-600 truncate">
              {submitUrl}
            </div>
            <button
              onClick={handleCopy}
              title="คัดลอก"
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
            </button>
            <a
              href={submitUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="เปิดในแท็บใหม่"
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-gray-500" />
            </a>
          </div>
          <p className="text-[11px] text-gray-400 text-center">
            ติด QR ไว้หน้าห้องพัก หรือส่งลิงก์ให้ผู้เช่าผ่าน Line / SMS
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Main Dashboard ────────────────────────────────────────────
type FloorFilter = 'all' | 1 | 2 | 3
type StatusFilter = 'all' | 'PENDING' | 'RESOLVED'

export function MaintenanceDashboard() {
  const stats = useMemo(() => getMaintenanceStats(), [])
  const [items, setItems] = useState<MaintenanceItem[]>(() => getMockMaintenanceItems())
  const [qrOpen, setQrOpen] = useState(false)

  const [floorFilter, setFloorFilter] = useState<FloorFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING')

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchFloor = floorFilter === 'all' || item.floor === floorFilter
      const matchStatus = statusFilter === 'all' || item.status === statusFilter
      return matchFloor && matchStatus
    })
  }, [items, floorFilter, statusFilter])

  function handleResolve(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'RESOLVED' as MaintenanceStatus,
              resolved_at: new Date().toISOString(),
              resolved_note: 'ดำเนินการแก้ไขเรียบร้อยแล้ว',
            }
          : item
      )
    )
  }

  const currentPending = items.filter((x) => x.status === 'PENDING').length

  return (
    <div className="px-4 sm:px-6 py-6 space-y-5 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-lg" style={{ color: '#2e006b' }}>คำขอแจ้งซ่อม</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            ข้อมูลจากระบบ Mock — เชื่อมต่อ Supabase แล้วจะดึงข้อมูลจริง
          </p>
        </div>
        <Button
          onClick={() => setQrOpen(true)}
          variant="outline"
          className="h-9 gap-2 text-sm font-medium border-purple-200 text-purple-700 hover:bg-purple-50 shrink-0"
        >
          <QrCode className="w-4 h-4" />
          ลิงก์แจ้งซ่อม
        </Button>
      </div>

      <QrDialog open={qrOpen} onClose={() => setQrOpen(false)} />

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="ทั้งหมด"      value={stats.total}    icon={Wrench}       color="#2e006b" bg="#f0ebff" />
        <StatCard label="รอดำเนินการ"  value={currentPending} icon={AlertTriangle} color="#d97706" bg="#fefce8" />
        <StatCard label="แก้ไขแล้ว"    value={items.filter(x => x.status === 'RESOLVED').length} icon={CheckCircle2} color="#059669" bg="#ecfdf5" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-3.5 flex flex-wrap items-center gap-3">
        {/* Floor filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-xs text-gray-500 font-medium mr-0.5">ชั้น:</span>
          {(['all', 1, 2, 3] as FloorFilter[]).map((f) => (
            <FilterPill
              key={String(f)}
              label={f === 'all' ? 'ทั้งหมด' : `ชั้น ${f}`}
              active={floorFilter === f}
              onClick={() => setFloorFilter(f)}
            />
          ))}
        </div>

        <div className="w-px h-5 bg-gray-100 hidden sm:block" />

        {/* Status filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 font-medium mr-0.5">สถานะ:</span>
          {([
            { val: 'all',     label: 'ทั้งหมด' },
            { val: 'PENDING', label: 'รอดำเนินการ' },
            { val: 'RESOLVED',label: 'แก้ไขแล้ว' },
          ] as { val: StatusFilter; label: string }[]).map(({ val, label }) => (
            <FilterPill
              key={val}
              label={label}
              active={statusFilter === val}
              onClick={() => setStatusFilter(val)}
            />
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-14 text-center">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm font-semibold text-gray-400">ไม่มีคำขอในหมวดนี้</p>
            <p className="text-xs text-gray-400 mt-1">ลองเปลี่ยน filter ดูครับ</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500 px-1">
              แสดง {filtered.length} รายการ
            </p>
            {filtered.map((item) => (
              <MaintenanceCard key={item.id} item={item} onResolve={handleResolve} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
