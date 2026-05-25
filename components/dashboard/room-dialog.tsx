'use client'

import { Room, RoomStatus } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  User,
  Phone,
  Mail,
  CalendarRange,
  Users,
  Wrench,
  Clock,
  FileText,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'

// ── Status config ────────────────────────────────────────────
const STATUS_META: Record<RoomStatus, { label: string; badgeStyle: string }> = {
  VACANT:      { label: 'ว่าง',       badgeStyle: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  OCCUPIED:    { label: 'มีผู้เช่า',   badgeStyle: 'bg-purple-100 text-purple-800 border-purple-200' },
  OVERDUE:     { label: 'ค้างชำระ',    badgeStyle: 'bg-rose-100 text-rose-700 border-rose-200' },
  MAINTENANCE: { label: 'แจ้งซ่อม',   badgeStyle: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Section wrapper ──────────────────────────────────────────
function Section({ title, icon: Icon, children }: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border bg-gray-50/60 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Icon className="w-4 h-4 text-gray-500" />
        {title}
      </div>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between text-sm gap-4">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-800 font-medium text-right">{value}</span>
    </div>
  )
}

// ── Main Dialog ──────────────────────────────────────────────
interface RoomDialogProps {
  room: Room | null
  open: boolean
  onClose: () => void
  onResolveMaintenace: (roomId: number) => void
  onSimulateMaintenance: (roomId: number) => void
}

export function RoomDialog({
  room,
  open,
  onClose,
  onResolveMaintenace,
  onSimulateMaintenance,
}: RoomDialogProps) {
  if (!room) return null

  const meta = STATUS_META[room.status]

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-xl font-bold" style={{ color: '#2e006b' }}>
                ห้อง {room.room_number}
              </DialogTitle>
              <p className="text-sm text-gray-400 mt-0.5">
                ชั้น {room.floor} · {room.room_type} · {room.base_price.toLocaleString()} บาท/เดือน
              </p>
            </div>
            <span
              className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.badgeStyle}`}
            >
              {meta.label}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">

          {/* Tenant info */}
          {room.tenant ? (
            <Section title="ข้อมูลผู้เช่าหลัก" icon={User}>
              <InfoRow label="ชื่อ"    value={room.tenant.name} />
              <InfoRow label="โทรศัพท์" value={room.tenant.phone} />
              <InfoRow label="อีเมล"   value={room.tenant.email} />
              <div className="border-t pt-3 mt-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                  <CalendarRange className="w-3.5 h-3.5" />
                  สัญญาเช่า
                </div>
                <InfoRow label="วันเริ่ม"  value={formatDate(room.tenant.start_date)} />
                <InfoRow label="วันสิ้นสุด" value={formatDate(room.tenant.end_date)} />
              </div>

              {room.tenant.roommates.length > 0 && (
                <div className="border-t pt-3 mt-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                    <Users className="w-3.5 h-3.5" />
                    ผู้พักร่วม ({room.tenant.roommates.length} คน)
                  </div>
                  {room.tenant.roommates.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{r.name}</span>
                      <span className="text-gray-500 text-xs">{r.phone}</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-500">
              ยังไม่มีผู้เช่า
            </div>
          )}

          {/* Maintenance request */}
          {room.status === 'MAINTENANCE' && room.maintenance_request && (
            <Section title="คำขอแจ้งซ่อม" icon={Wrench}>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{room.maintenance_request.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{room.maintenance_request.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                แจ้งเมื่อ {formatDateTime(room.maintenance_request.submitted_at)}
              </div>
            </Section>
          )}

          {/* OVERDUE warning */}
          {room.status === 'OVERDUE' && (
            <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-4">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-rose-700">ค้างชำระค่าเช่า</p>
                <p className="text-xs text-rose-500 mt-0.5">ผู้เช่ายังไม่ชำระค่าห้องในรอบบิลปัจจุบัน</p>
              </div>
            </div>
          )}

          {/* Quick actions */}
          {room.tenant && (
            <Section title="ดำเนินการด่วน" icon={Zap}>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`/meter/${room.room_number}`}
                  className="flex items-center justify-center gap-1.5 h-9 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" style={{ color: '#2e006b' }} />
                  จดมิเตอร์
                </a>
                <a
                  href={`/bills/${room.room_number}`}
                  className="flex items-center justify-center gap-1.5 h-9 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" style={{ color: '#2e006b' }} />
                  จัดการบิล
                </a>
              </div>
            </Section>
          )}

          {/* Admin actions */}
          <div className="space-y-2 pt-1">
            {room.status === 'MAINTENANCE' && (
              <Button
                onClick={() => { onResolveMaintenace(room.id); onClose() }}
                className="w-full h-10 font-semibold text-white"
                style={{ background: '#2e006b' }}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                แก้ไขเสร็จแล้ว — เปลี่ยนสถานะกลับปกติ
              </Button>
            )}

            {/* Simulate tenant maintenance request (dev only) */}
            {(room.status === 'OCCUPIED' || room.status === 'OVERDUE') && (
              <Button
                variant="outline"
                onClick={() => { onSimulateMaintenance(room.id); onClose() }}
                className="w-full h-9 text-sm border-dashed border-yellow-400 text-yellow-700 hover:bg-yellow-50"
              >
                <Wrench className="w-3.5 h-3.5 mr-1.5" />
                [Dev] จำลอง: ผู้เช่าแจ้งซ่อม
              </Button>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
