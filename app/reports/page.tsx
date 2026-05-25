import { AppLayout } from '@/components/layout/app-layout'
import { ReportsDashboard } from '@/components/reports/reports-dashboard'

export default function ReportsPage() {
  return (
    <AppLayout title="รายงานสรุปผล" breadcrumb="Dashboard">
      <ReportsDashboard />
    </AppLayout>
  )
}
