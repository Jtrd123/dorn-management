import { AppLayout } from '@/components/layout/app-layout'
import { Wrench } from 'lucide-react'

export default function MaintenancePage() {
  return (
    <AppLayout title="แจ้งซ่อม" breadcrumb="Dashboard">
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: '#fefce8', border: '2px solid #fde047' }}>
          <Wrench className="w-8 h-8" style={{ color: '#d97706' }} />
        </div>
        <h2 className="text-xl font-bold mb-1" style={{ color: '#2e006b' }}>หน้าแจ้งซ่อม</h2>
        <p className="text-gray-400 text-sm">อยู่ระหว่างพัฒนา — Coming Soon (v0.5.0)</p>
      </div>
    </AppLayout>
  )
}
