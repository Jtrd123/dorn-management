import { AppLayout } from '@/components/layout/app-layout'
import { RoomBillDetail } from '@/components/bills/room-bill-detail'

export default async function RoomBillPage({
  params,
}: {
  params: Promise<{ roomNumber: string }>
}) {
  const { roomNumber } = await params
  return (
    <AppLayout title={`บิลห้อง ${roomNumber}`} breadcrumb="จัดการบิล">
      <RoomBillDetail roomNumber={roomNumber} />
    </AppLayout>
  )
}
