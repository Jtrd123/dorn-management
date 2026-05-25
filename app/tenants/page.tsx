import { AppLayout } from '@/components/layout/app-layout'
import { Users } from 'lucide-react'

export default function TenantsPage() {
  return (
    <AppLayout title="ผู้เช่า" breadcrumb="Dashboard">
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: '#f5f0ff', border: '2px solid #c4b5fd' }}>
          <Users className="w-8 h-8" style={{ color: '#7c3aed' }} />
        </div>
        <h2 className="text-xl font-bold mb-1" style={{ color: '#2e006b' }}>หน้าผู้เช่า</h2>
        <p className="text-gray-400 text-sm">อยู่ระหว่างพัฒนา — Coming Soon (v0.5.0)</p>
      </div>
    </AppLayout>
  )
}
