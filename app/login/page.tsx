'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { MOCK_USER, setMockSession } from '@/lib/mock-auth'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // จำลอง network delay
    await new Promise((r) => setTimeout(r, 700))

    if (form.username === MOCK_USER.username && form.password === MOCK_USER.password) {
      setMockSession({ role: MOCK_USER.role, name: MOCK_USER.name })
      router.push('/dashboard')
    } else {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a003d 0%, #2e006b 60%, #3d0085 100%)' }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: '#ffd445', opacity: 0.08, filter: 'blur(80px)' }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: '#ffd445', opacity: 0.07, filter: 'blur(70px)' }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Gold top accent bar */}
        <div className="h-1.5 rounded-t-2xl" style={{ background: '#ffd445' }} />

        <Card className="rounded-t-none rounded-b-2xl border-0 shadow-2xl bg-white">
          <CardHeader className="text-center pb-2 pt-10 px-8">
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl"
                style={{ background: '#2e006b' }}
              >
                <Building2 className="w-10 h-10" style={{ color: '#ffd445' }} />
              </div>
            </div>

            <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#2e006b' }}>
              ระบบจัดการหอพัก
            </h1>
            <p className="text-sm text-gray-500 mt-1">Dorm Management System</p>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  ชื่อผู้ใช้
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="กรอกชื่อผู้ใช้"
                  autoComplete="username"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  className="h-11 border-gray-200 focus-visible:ring-1 focus-visible:ring-purple-700 focus-visible:border-purple-700 transition-colors"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  รหัสผ่าน
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="กรอกรหัสผ่าน"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="h-11 pr-11 border-gray-200 focus-visible:ring-1 focus-visible:ring-purple-700 focus-visible:border-purple-700 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-base font-semibold text-white mt-1 transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: '#2e006b', border: 'none' }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    กำลังเข้าสู่ระบบ...
                  </span>
                ) : (
                  'เข้าสู่ระบบ'
                )}
              </Button>
            </form>

            {/* Dev hint */}
            <div
              className="mt-6 p-3.5 rounded-xl border border-dashed text-center"
              style={{ borderColor: '#ffd445', background: '#fffdf0' }}
            >
              <p className="text-xs font-semibold text-gray-500 mb-1">ข้อมูลสำหรับทดสอบ</p>
              <p className="text-xs text-gray-600">
                Username:{' '}
                <span className="font-mono font-bold" style={{ color: '#2e006b' }}>
                  admin
                </span>
                &ensp;|&ensp;Password:{' '}
                <span className="font-mono font-bold" style={{ color: '#2e006b' }}>
                  admin1234
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-white/55 mt-4">© 2026 ระบบจัดการหอพัก</p>
      </div>
    </main>
  )
}
