import { AppLayout } from '@/components/layout/app-layout'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'

export default function DashboardPage() {
  return (
    <AppLayout title="ผังห้องพัก" breadcrumb="Dashboard">
      <AdminDashboard />
    </AppLayout>
  )
}
