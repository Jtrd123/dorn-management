import { UtilityForm } from '@/components/meter/utility-form'

export default async function MeterPage({
  params,
}: {
  params: Promise<{ roomNumber: string }>
}) {
  const { roomNumber } = await params
  return <UtilityForm roomNumber={roomNumber} />
}
