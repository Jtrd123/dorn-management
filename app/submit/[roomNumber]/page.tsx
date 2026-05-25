import { redirect } from 'next/navigation'

export default async function SubmitRoomPage({
  params,
}: {
  params: Promise<{ roomNumber: string }>
}) {
  // Legacy URL — redirect to single form
  await params
  redirect('/submit')
}
