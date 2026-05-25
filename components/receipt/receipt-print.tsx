'use client'

import { useRouter } from 'next/navigation'
import { Printer, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getRoomBillingData, formatThaiMonth } from '@/lib/mock-billing-data'
import { bahtText } from '@/lib/thai-baht'

function zeroPad(n: number, len = 5) {
  return String(n).padStart(len, '0')
}

function formatDate(iso?: string) {
  const d = iso ? new Date(iso) : new Date()
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function genReceiptNo(roomNumber: string, billingMonth: string) {
  const seq = parseInt(roomNumber.replace(/\D/g, '')) + 1000
  const ym = billingMonth.replace('-', '')
  return `REC-${ym}-${zeroPad(seq)}`
}

// ── PRINT CSS (injected via <style> so it only affects this page) ─
const PRINT_CSS = `
@media print {
  /* Hide everything except the receipt */
  .no-print { display: none !important; }

  /* Page setup for A5 landscape */
  @page {
    size: A5 landscape;
    margin: 5mm;
  }

  /* Reset backgrounds and colors for dot-matrix */
  * {
    background: white !important;
    background-color: white !important;
    box-shadow: none !important;
    text-shadow: none !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body {
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Ensure receipt fills the page */
  .receipt-wrapper {
    display: block !important;
    padding: 0 !important;
    background: white !important;
  }

  .receipt-card {
    border: 2px solid black !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    max-width: 100% !important;
    width: 100% !important;
    font-size: 11pt !important;
  }

  /* All table borders must be solid black for dot-matrix */
  table, th, td {
    border-color: black !important;
    color: black !important;
  }

  /* Force font to be readable on dot-matrix */
  * {
    font-family: 'Sarabun', 'TH Sarabun New', 'Arial', sans-serif !important;
    color: black !important;
  }
}
`

interface ReceiptProps {
  roomNumber: string
}

export function ReceiptPrint({ roomNumber }: ReceiptProps) {
  const router = useRouter()
  const billing = getRoomBillingData(roomNumber)
  const last = billing.history[billing.history.length - 1]

  const wUnits = last.water_current - last.water_previous
  const eUnits = last.electric_current - last.electric_previous
  const wAmt = wUnits * last.water_unit_price
  const eAmt = eUnits * last.electric_unit_price
  const total = billing.base_price + wAmt + eAmt

  const billingMonth = last.billing_month
  const receiptNo = genReceiptNo(roomNumber, billingMonth.slice(0, 7))
  const issueDate = formatDate()

  return (
    <>
      {/* Inject print CSS */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      {/* ── Screen wrapper (hidden on print) ── */}
      <div className="receipt-wrapper min-h-screen py-8 px-4" style={{ background: '#f5f3ff' }}>

        {/* Control bar — hidden when printing */}
        <div className="no-print max-w-[800px] mx-auto mb-5 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับ
          </button>
          <div className="flex-1" />
          <span className="text-xs text-gray-500">ขนาดกระดาษ: A5 แนวนอน · Dot Matrix</span>
          <Button
            onClick={() => window.print()}
            className="h-9 gap-2 text-sm font-semibold text-white"
            style={{ background: '#2e006b' }}
          >
            <Printer className="w-4 h-4" />
            สั่งพิมพ์
          </Button>
        </div>

        {/* ── Receipt Card ── */}
        {/* On screen: styled preview; on print: dot-matrix output */}
        <div
          className="receipt-card max-w-[800px] mx-auto bg-white border-2 border-black"
          style={{ fontFamily: "'Sarabun', 'TH Sarabun New', 'Arial', sans-serif" }}
        >

          {/* ── HEADER ── */}
          <div className="border-b-2 border-black px-5 py-3 flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xl font-bold leading-tight">หอพักสุขสงบ</p>
              <p className="text-xs mt-0.5 text-gray-600">
                123 ถ.พระราม 4 แขวงบางรัก เขตบางรัก กรุงเทพฯ 10500
              </p>
              <p className="text-xs text-gray-500">โทร. 02-xxx-xxxx</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold uppercase tracking-wide">ใบเสร็จรับเงิน</p>
              <p className="text-[11px] text-gray-500 uppercase">Receipt / Tax Invoice</p>
              <div className="mt-1.5 border border-black px-3 py-1 inline-block text-right">
                <p className="text-[10px] text-gray-500">เลขที่ / No.</p>
                <p className="text-sm font-bold font-mono">{receiptNo}</p>
              </div>
            </div>
          </div>

          {/* ── ROOM + TENANT INFO ── */}
          <div className="border-b-2 border-black grid grid-cols-2">
            <div className="border-r-2 border-black px-4 py-2.5 space-y-1">
              <div className="flex gap-2 text-sm">
                <span className="text-gray-500 w-16 shrink-0">ห้อง:</span>
                <span className="font-bold">{roomNumber} (ชั้น {billing.floor} · {billing.room_type})</span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-gray-500 w-16 shrink-0">ชื่อ:</span>
                <span className="font-semibold">{billing.tenant_name}</span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-gray-500 w-16 shrink-0">ประจำเดือน:</span>
                <span className="font-semibold">{formatThaiMonth(billingMonth)}</span>
              </div>
            </div>
            <div className="px-4 py-2.5 space-y-1">
              <div className="flex gap-2 text-sm">
                <span className="text-gray-500 w-20 shrink-0">วันที่ออก:</span>
                <span className="font-semibold">{issueDate}</span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-gray-500 w-20 shrink-0">วันครบกำหนด:</span>
                <span className="font-semibold">
                  {formatDate(new Date(billingMonth.slice(0, 7) + '-10').toISOString())}
                </span>
              </div>
            </div>
          </div>

          {/* ── ITEMS TABLE ── */}
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left px-4 py-2 font-bold border-r border-black">รายการ</th>
                <th className="text-center px-3 py-2 font-bold border-r border-black w-24">หน่วยที่ใช้</th>
                <th className="text-center px-3 py-2 font-bold border-r border-black w-28">ราคา/หน่วย (บาท)</th>
                <th className="text-right px-4 py-2 font-bold w-32">จำนวนเงิน (บาท)</th>
              </tr>
            </thead>
            <tbody>
              {/* Room rent */}
              <tr className="border-b border-black">
                <td className="px-4 py-2 border-r border-black">
                  ค่าเช่าห้องพัก ({billing.room_type})
                </td>
                <td className="px-3 py-2 text-center border-r border-black">–</td>
                <td className="px-3 py-2 text-center border-r border-black">–</td>
                <td className="px-4 py-2 text-right tabular-nums font-medium">
                  {billing.base_price.toLocaleString()}
                </td>
              </tr>

              {/* Water */}
              <tr className="border-b border-black">
                <td className="px-4 py-2 border-r border-black">
                  ค่าน้ำประปา
                  <span className="text-xs text-gray-500 ml-2 font-normal">
                    ({last.water_previous.toLocaleString()} → {last.water_current.toLocaleString()})
                  </span>
                </td>
                <td className="px-3 py-2 text-center tabular-nums border-r border-black">{wUnits}</td>
                <td className="px-3 py-2 text-center tabular-nums border-r border-black">
                  {last.water_unit_price.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right tabular-nums font-medium">{wAmt.toLocaleString()}</td>
              </tr>

              {/* Electric */}
              <tr className="border-b-2 border-black">
                <td className="px-4 py-2 border-r border-black">
                  ค่าไฟฟ้า
                  <span className="text-xs text-gray-500 ml-2 font-normal">
                    ({last.electric_previous.toLocaleString()} → {last.electric_current.toLocaleString()})
                  </span>
                </td>
                <td className="px-3 py-2 text-center tabular-nums border-r border-black">{eUnits}</td>
                <td className="px-3 py-2 text-center tabular-nums border-r border-black">
                  {last.electric_unit_price.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right tabular-nums font-medium">{eAmt.toLocaleString()}</td>
              </tr>
            </tbody>

            {/* Total */}
            <tfoot>
              <tr className="border-b-2 border-black">
                <td colSpan={3} className="px-4 py-2.5 font-bold text-right border-r border-black text-base">
                  รวมเงินทั้งสิ้น
                </td>
                <td className="px-4 py-2.5 text-right font-bold text-base tabular-nums">
                  {total.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="px-4 py-2 text-center text-sm font-semibold">
                  ({bahtText(total)})
                </td>
              </tr>
            </tfoot>
          </table>

          {/* ── SIGNATURE AREA ── */}
          <div className="border-t-2 border-black grid grid-cols-2">
            <div className="border-r-2 border-black px-6 py-4 text-center">
              <div className="h-10 flex items-end justify-center mb-1">
                <div className="w-48 border-b border-black" />
              </div>
              <p className="text-sm">ลงชื่อผู้รับเงิน / Received by</p>
              <p className="text-xs text-gray-500 mt-1">( ............................................ )</p>
              <p className="text-xs text-gray-500 mt-0.5">
                วันที่ ........./........./..........
              </p>
            </div>
            <div className="px-6 py-4 text-center">
              <div className="h-10 flex items-end justify-center mb-1">
                <div className="w-48 border-b border-black" />
              </div>
              <p className="text-sm">ลงชื่อผู้จ่ายเงิน / Paid by</p>
              <p className="text-xs text-gray-500 mt-1">( ............................................ )</p>
              <p className="text-xs text-gray-500 mt-0.5">
                วันที่ ........./........./..........
              </p>
            </div>
          </div>

          {/* Footer note */}
          <div className="border-t border-black px-5 py-1.5 text-center">
            <p className="text-[10px] text-gray-500">
              เอกสารนี้ออกโดยระบบจัดการหอพัก · {receiptNo} · สงวนลิขสิทธิ์
            </p>
          </div>
        </div>

        {/* Screen-only note */}
        <div className="no-print max-w-[800px] mx-auto mt-4 text-center">
          <p className="text-xs text-gray-500">
            Preview ใบเสร็จ · เมื่อสั่งพิมพ์ สีพื้นหลังจะถูกล้างออกอัตโนมัติสำหรับ Dot Matrix
          </p>
        </div>
      </div>
    </>
  )
}
