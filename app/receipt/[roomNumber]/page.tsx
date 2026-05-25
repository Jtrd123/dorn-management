import { ReceiptPrint } from '@/components/receipt/receipt-print'

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ roomNumber: string }>
}) {
  const { roomNumber } = await params
  return <ReceiptPrint roomNumber={roomNumber} />
}
