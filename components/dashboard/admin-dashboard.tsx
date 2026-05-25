'use client'

import { useState, useMemo } from 'react'
import { DoorOpen, Users, FileText, Wrench, Building2 } from 'lucide-react'
import { Room, RoomStatus } from '@/lib/types'
import { MOCK_ROOMS, FLOOR_LABELS } from '@/lib/mock-data'
import { RoomDialog } from './room-dialog'

// ── Status config ─────────────────────────────────────────────
const STATUS_CONFIG: Record<RoomStatus, {
  label: string; bg: string; border: string; text: string; dot: string
}> = {
  VACANT:      { label: 'ว่าง',     bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', dot: '#10b981' },
  OCCUPIED:    { label: 'มีผู้เช่า', bg: '#f5f0ff', border: '#c4b5fd', text: '#3b0764', dot: '#7c3aed' },
  OVERDUE:     { label: 'ค้างชำระ',  bg: '#fff1f2', border: '#fecdd3', text: '#9f1239', dot: '#f43f5e' },
  MAINTENANCE: { label: 'แจ้งซ่อม', bg: '#fefce8', border: '#fde047', text: '#713f12', dot: '#f59e0b' },
}

const MOCK_MAINT = [{
  id: 'm-sim', title: 'แจ้งซ่อม (จำลอง)',
  description: 'ผู้เช่าส่งคำขอแจ้งซ่อมผ่านแอป', submitted_at: new Date().toISOString(),
}]

type FloorFilter = 'all' | 1 | 2 | 3

// ── Room Card ─────────────────────────────────────────────────
function RoomCard({ room, onClick }: { room: Room; onClick: () => void }) {
  const cfg = STATUS_CONFIG[room.status]
  return (
    <button
      onClick={onClick}
      className="group relative w-full aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all duration-150 hover:scale-105 hover:shadow-md active:scale-100 cursor-pointer"
      style={{ background: cfg.bg, borderColor: cfg.border }}
    >
      <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: cfg.dot }} />
      <span className="text-[11px] sm:text-sm font-bold leading-none" style={{ color: cfg.text }}>
        {room.room_number}
      </span>
      <span className="text-[8px] sm:text-[9px] font-medium opacity-60 leading-none" style={{ color: cfg.text }}>
        {room.room_type === 'Deluxe' ? 'DX' : 'STD'}
      </span>
    </button>
  )
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: number; icon: React.ElementType; color: string; sub?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: color + '18' }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold leading-none" style={{ color }}>{value}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-tight">{label}</p>
        {sub && <p className="text-[10px] text-gray-300 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── Floor selector button ────────────────────────────────────
function FloorTab({
  value, label, active, count, onClick,
}: {
  value: FloorFilter; label: string; active: boolean; count: number; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm
        font-semibold transition-all duration-200 whitespace-nowrap
        ${active
          ? 'text-purple-900 shadow-md'
          : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
      style={active ? { background: '#ffd445' } : {}}
    >
      {label}
      <span
        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none
          ${active ? 'bg-purple-900/20 text-purple-900' : 'bg-white/15 text-white/60'}`}
      >
        {count}
      </span>
    </button>
  )
}

// ── Floor row label (shown when "ทุกชั้น" selected) ──────────
function FloorDivider({ floor, rooms }: { floor: number; rooms: Room[] }) {
  const counts = useMemo(() => {
    const c = { VACANT: 0, OCCUPIED: 0, OVERDUE: 0, MAINTENANCE: 0 }
    rooms.forEach((r) => c[r.status]++)
    return c
  }, [rooms])

  return (
    <div className="flex items-center gap-3 px-1 mb-2 mt-4 first:mt-0">
      <div className="flex items-center gap-1.5">
        <Building2 className="w-3.5 h-3.5" style={{ color: '#2e006b' }} />
        <span className="text-xs font-bold" style={{ color: '#2e006b' }}>{FLOOR_LABELS[floor]}</span>
      </div>
      <div className="flex-1 h-px bg-purple-100" />
      <div className="flex items-center gap-1.5">
        {(Object.entries(counts) as [RoomStatus, number][])
          .filter(([, n]) => n > 0)
          .map(([status, count]) => (
            <span
              key={status}
              className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold border"
              style={{
                background: STATUS_CONFIG[status].bg,
                color: STATUS_CONFIG[status].text,
                borderColor: STATUS_CONFIG[status].border,
              }}
            >
              {STATUS_CONFIG[status].label} {count}
            </span>
          ))}
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────
export function AdminDashboard() {
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedFloor, setSelectedFloor] = useState<FloorFilter>('all')

  const stats = useMemo(() => ({
    total:       rooms.length,
    vacant:      rooms.filter((r) => r.status === 'VACANT').length,
    occupied:    rooms.filter((r) => r.status === 'OCCUPIED').length,
    overdue:     rooms.filter((r) => r.status === 'OVERDUE').length,
    maintenance: rooms.filter((r) => r.status === 'MAINTENANCE').length,
  }), [rooms])

  // Rooms shown in the grid (filtered by floor tab)
  const visibleRooms = useMemo(() =>
    selectedFloor === 'all' ? rooms : rooms.filter((r) => r.floor === selectedFloor),
    [rooms, selectedFloor]
  )

  // Count per floor for tab badges
  const floorCount = useMemo(() => ({
    all: rooms.length,
    1: rooms.filter((r) => r.floor === 1).length,
    2: rooms.filter((r) => r.floor === 2).length,
    3: rooms.filter((r) => r.floor === 3).length,
  }), [rooms])

  function handleResolveMaintenance(roomId: number) {
    setRooms((prev) => prev.map((r) =>
      r.id === roomId ? { ...r, status: 'OCCUPIED', maintenance_request: undefined } : r
    ))
  }

  function handleSimulateMaintenance(roomId: number) {
    setRooms((prev) => prev.map((r) =>
      r.id === roomId ? { ...r, status: 'MAINTENANCE', maintenance_request: MOCK_MAINT[0] } : r
    ))
  }

  const floors: (1 | 2 | 3)[] = [1, 2, 3]

  return (
    <div className="px-4 sm:px-6 py-6 space-y-4 max-w-7xl mx-auto">

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="ห้องทั้งหมด"  value={stats.total}       icon={DoorOpen} color="#2e006b" sub={`${stats.vacant} ว่างอยู่`} />
        <StatCard label="มีผู้เช่า"     value={stats.occupied}    icon={Users}    color="#7c3aed" />
        <StatCard label="ค้างชำระ"      value={stats.overdue}     icon={FileText} color="#f43f5e" />
        <StatCard label="รอซ่อมบำรุง"   value={stats.maintenance} icon={Wrench}   color="#f59e0b" />
      </div>

      {/* ── Room Grid Frame ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-purple-50 overflow-hidden">

        {/* Frame header: Floor tabs */}
        <div
          className="flex items-center gap-1 px-3 py-2.5 flex-wrap"
          style={{ background: '#2e006b' }}
        >
          {/* "ทุกชั้น" tab */}
          <FloorTab
            value="all"
            label="ทุกชั้น"
            active={selectedFloor === 'all'}
            count={floorCount.all}
            onClick={() => setSelectedFloor('all')}
          />

          {/* Divider */}
          <div className="w-px h-5 bg-white/20 mx-1" />

          {/* Per-floor tabs */}
          {floors.map((f) => (
            <FloorTab
              key={f}
              value={f}
              label={`ชั้น ${f}`}
              active={selectedFloor === f}
              count={floorCount[f]}
              onClick={() => setSelectedFloor(f)}
            />
          ))}

          {/* Right side: legend */}
          <div className="ml-auto hidden sm:flex items-center gap-3">
            {(Object.entries(STATUS_CONFIG) as [RoomStatus, typeof STATUS_CONFIG[RoomStatus]][]).map(
              ([status, cfg]) => (
                <div key={status} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: cfg.dot }} />
                  <span className="text-white/50 text-[10px]">{cfg.label}</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Grid content */}
        <div className="p-3 sm:p-4">
          {selectedFloor === 'all' ? (
            // Show all floors with dividers
            <div>
              {floors.map((floor) => {
                const floorRooms = rooms.filter((r) => r.floor === floor)
                return (
                  <div key={floor}>
                    <FloorDivider floor={floor} rooms={floorRooms} />
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-3">
                      {floorRooms.map((room) => (
                        <RoomCard
                          key={room.id}
                          room={room}
                          onClick={() => { setSelectedRoom(room); setDialogOpen(true) }}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            // Show single floor
            <div>
              <FloorDivider
                floor={selectedFloor}
                rooms={visibleRooms}
              />
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {visibleRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onClick={() => { setSelectedRoom(room); setDialogOpen(true) }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Frame footer */}
        <div className="border-t border-gray-50 px-4 py-2 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            แสดง <span className="font-semibold text-gray-600">{visibleRooms.length}</span> ห้อง
            {selectedFloor !== 'all' && ` · ${FLOOR_LABELS[selectedFloor]}`}
          </p>
          <p className="text-[10px] text-gray-300 hidden sm:block">คลิกที่ห้องเพื่อดูรายละเอียด</p>
        </div>
      </div>

      {/* ── Mobile legend (below grid) ── */}
      <div className="flex sm:hidden flex-wrap items-center gap-x-4 gap-y-1.5 px-1">
        <span className="text-xs text-gray-400 font-medium w-full">สถานะ:</span>
        {(Object.entries(STATUS_CONFIG) as [RoomStatus, typeof STATUS_CONFIG[RoomStatus]][]).map(
          ([status, cfg]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: cfg.dot }} />
              <span className="text-xs text-gray-500">{cfg.label}</span>
            </div>
          )
        )}
      </div>

      <RoomDialog
        room={selectedRoom}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onResolveMaintenace={handleResolveMaintenance}
        onSimulateMaintenance={handleSimulateMaintenance}
      />
    </div>
  )
}
