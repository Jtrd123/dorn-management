import { AppLayout } from '@/components/layout/app-layout'
import { BillsDashboard } from '@/components/bills/bills-dashboard'

export default function BillsPage() {
  return (
    <AppLayout title="จัดการบิล" breadcrumb="Dashboard">
      <BillsDashboard />
    </AppLayout>
  )
}
