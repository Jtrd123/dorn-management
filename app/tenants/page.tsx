import { AppLayout } from '@/components/layout/app-layout'
import { TenantsDashboard } from '@/components/tenants/tenants-dashboard'

export default function TenantsPage() {
  return (
    <AppLayout title="ข้อมูลผู้เช่า" breadcrumb="Dashboard">
      <TenantsDashboard />
    </AppLayout>
  )
}
