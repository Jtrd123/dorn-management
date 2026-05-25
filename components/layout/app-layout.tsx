'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Building2, BarChart3, Wrench, Users, FileText,
  Menu, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { getMockSession, clearMockSession, type MockSession } from '@/lib/mock-auth'

const NAV = [
  { href: '/dashboard',   icon: Building2, label: 'ภาพรวม',   sub: 'ผังห้องพัก' },
  { href: '/bills',       icon: FileText,  label: 'บิล',       sub: 'จัดการบิล' },
  { href: '/reports',     icon: BarChart3, label: 'รายงาน',   sub: 'สรุปรายรับ' },
  { href: '/maintenance', icon: Wrench,    label: 'แจ้งซ่อม',  sub: 'คำขอซ่อมบำรุง' },
  { href: '/tenants',     icon: Users,     label: 'ผู้เช่า',   sub: 'ข้อมูลสัญญา' },
]

// ── Nav item (full) ──────────────────────────────────────────
function NavItem({ href, icon: Icon, label, sub, active, onClick }: {
  href: string; icon: React.ElementType; label: string; sub: string
  active: boolean; onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group
        ${active ? 'bg-white/15 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors
        ${active ? 'bg-white/20' : 'group-hover:bg-white/10'}`}>
        <Icon className="w-4 h-4" style={{ color: active ? '#ffd445' : undefined }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm leading-none ${active ? 'font-semibold' : 'font-medium'}`}>{label}</p>
        <p className="text-[11px] mt-0.5 leading-none" style={{ color: 'rgba(255,255,255,0.55)' }}>{sub}</p>
      </div>
      {active && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#ffd445' }} />}
    </Link>
  )
}

// ── Nav item (icon-only, collapsed) ─────────────────────────
function NavItemCollapsed({ href, icon: Icon, label, active, onClick }: {
  href: string; icon: React.ElementType; label: string; active: boolean; onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={label}
      className={`relative flex items-center justify-center w-10 h-10 rounded-xl mx-auto transition-all group
        ${active ? 'bg-white/15' : 'hover:bg-white/10'}`}
    >
      <Icon className="w-5 h-5" style={{ color: active ? '#ffd445' : 'rgba(255,255,255,0.55)' }} />
      {active && (
        <span className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full"
          style={{ background: '#ffd445' }} />
      )}
      {/* Tooltip */}
      <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg"
        style={{ background: '#1a003d', color: 'white' }}>
        {label}
      </span>
    </Link>
  )
}

// ── Sidebar inner ────────────────────────────────────────────
interface SidebarInnerProps {
  onNavigate?: () => void
  collapsed?: boolean
  onToggle?: () => void
}

function SidebarInner({ onNavigate, collapsed = false, onToggle }: SidebarInnerProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [session, setSession] = useState<MockSession | null>(null)

  useEffect(() => { setSession(getMockSession()) }, [])

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#2e006b' }}>

      {/* Brand */}
      <div className={`flex items-center border-b border-white/10 shrink-0 transition-all duration-300
        ${collapsed ? 'justify-center px-0 py-4 h-16' : 'gap-3 px-5 py-5'}`}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,0.12)' }}>
          <Building2 className="w-5 h-5" style={{ color: '#ffd445' }} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-none truncate">หอพักสุขสงบ</p>
            <p className="text-white/65 text-[11px] mt-0.5">ระบบจัดการหอพัก</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-1 py-4 space-y-1 overflow-y-auto ${collapsed ? 'px-1' : 'px-3'}`}>
        {!collapsed && (
          <p className="text-white/50 text-[10px] font-semibold tracking-wider uppercase px-3 mb-2">
            เมนูหลัก
          </p>
        )}
        {NAV.map((item) =>
          collapsed ? (
            <NavItemCollapsed
              key={item.label}
              {...item}
              active={pathname.startsWith(item.href)}
              onClick={onNavigate}
            />
          ) : (
            <NavItem
              key={item.label}
              {...item}
              active={pathname.startsWith(item.href)}
              onClick={onNavigate}
            />
          )
        )}
      </nav>

      {/* User info */}
      {!collapsed && session && (
        <div className="px-4 pt-3 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: 'rgba(255,212,69,0.2)', color: '#ffd445' }}>
              {session.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate leading-none">{session.name}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: '#ffd445', color: '#2e006b' }}>
                {session.role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Logout + Toggle row */}
      <div className={`flex items-center border-t border-white/10 shrink-0
        ${collapsed ? 'flex-col gap-2 py-3' : 'justify-between px-4 py-3'}`}>
        <button
          onClick={() => { clearMockSession(); router.replace('/login') }}
          title="ออกจากระบบ"
          className={`flex items-center gap-2 text-white/60 hover:text-rose-300 text-xs transition-colors
            ${collapsed ? 'justify-center w-10 h-10 rounded-xl hover:bg-white/10' : ''}`}
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          {!collapsed && <span>ออกจากระบบ</span>}
        </button>

        {/* Collapse toggle — desktop only (onToggle is undefined inside Sheet) */}
        {onToggle && (
          <button
            onClick={onToggle}
            title={collapsed ? 'ขยาย Sidebar' : 'หุบ Sidebar'}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            {collapsed
              ? <ChevronRight className="w-4 h-4" />
              : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  )
}

// ── App Layout ───────────────────────────────────────────────
export function AppLayout({
  children,
  title,
  breadcrumb,
}: {
  children: React.ReactNode
  title: string
  breadcrumb?: string
}) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const sidebarW = collapsed ? 'lg:w-16' : 'lg:w-60'
  const contentML = collapsed ? 'lg:ml-16' : 'lg:ml-60'

  return (
    <div className="min-h-screen flex" style={{ background: '#f5f3ff' }}>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-40 shadow-xl
          transition-all duration-300 ease-in-out ${sidebarW}`}
      >
        <SidebarInner
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
        />
      </aside>

      {/* Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${contentML}`}>

        {/* Top bar */}
        <header
          className="sticky top-0 z-30 h-14 flex items-center gap-3 px-4 shadow-md shrink-0"
          style={{ background: '#2e006b' }}
        >
          {/* Mobile hamburger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              className="lg:hidden text-white/60 hover:text-white transition-colors p-1 rounded"
              aria-label="เปิดเมนู"
            >
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-0" style={{ background: '#2e006b' }}>
              {/* Mobile sheet: always expanded, no toggle button */}
              <SidebarInner onNavigate={() => setSheetOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex-1 flex items-center gap-2 text-sm min-w-0">
            {breadcrumb && (
              <>
                <span className="text-white/40 hidden sm:block truncate">{breadcrumb}</span>
                <ChevronRight className="w-3.5 h-3.5 text-white/30 hidden sm:block shrink-0" />
              </>
            )}
            <span className="text-white font-bold truncate">{title}</span>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
