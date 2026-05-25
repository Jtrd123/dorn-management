import { AppLayout } from '@/components/layout/app-layout'
import { MaintenanceDashboard } from '@/components/maintenance/maintenance-dashboard'

export default function MaintenancePage() {
  return (
    <AppLayout title="คำขอแจ้งซ่อม" breadcrumb="Dashboard">
      <MaintenanceDashboard />
    </AppLayout>
  )
}
