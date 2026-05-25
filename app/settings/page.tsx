import { AppLayout } from '@/components/layout/app-layout'
import { SettingsDashboard } from '@/components/settings/settings-dashboard'

export default function SettingsPage() {
  return (
    <AppLayout title="ตั้งค่าระบบ" breadcrumb="Dashboard">
      <SettingsDashboard />
    </AppLayout>
  )
}
