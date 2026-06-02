'use client'

import Link from 'next/link'
import { ArrowLeft, Printer, Building2, Scissors } from 'lucide-react'
import { getRoomBillingData, formatThaiMonth } from '@/lib/mock-billing-data'
import { getMockBillByRoom } from '@/lib/mock-bills-data'
import { bahtText } from '@/lib/thai-baht'

// ── Dorm / School info ────────────────────────────────────────
const DORM_INFO = {
  school:  'โรงเรียนสุคนธีรวิทย์',
  dorm:    'หอพักคบุคลากร',
  address: '304 หมู่ 8 ตำบลสามพราน อำเภอสามพราน จังหวัดนครปฐม 73110',
  phone:   '034-325782-5',
  fax:     '034-325785',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

// ── Data helpers ──────────────────────────────────────────────
interface ReceiptData {
  receiptNo: string
  printDate: string
  roomNumber: string
  floor: number
  roomType: string
  tenantName: string
  billingMonth: string
  roomPrice: number
  waterUnits: number
  waterUnitPrice: number
  waterAmount: number
  electricUnits: number
  electricUnitPrice: number
  electricAmount: number
  totalAmount: number
}

function buildReceiptData(roomNumber: string): ReceiptData {
  const bill = getMockBillByRoom(roomNumber)
  const history = getRoomBillingData(roomNumber)
  const latest = history.history[history.history.length - 1]

  const month = bill?.billing_month ?? latest?.billing_month ?? new Date().toISOString()
  const monthStr = month.slice(0, 7).replace('-', '')
  const receiptNo = `RC-${monthStr}-${roomNumber}`

  if (bill) {
    return {
      receiptNo,
      printDate: '2026-05-24',
      roomNumber,
      floor: bill.floor,
      roomType: bill.room_type,
      tenantName: bill.tenant_name,
      billingMonth: bill.billing_month,
      roomPrice: bill.room_price,
      waterUnits: bill.water_units,
      waterUnitPrice: bill.water_unit_price,
      waterAmount: bill.water_amount,
      electricUnits: bill.electric_units,
      electricUnitPrice: bill.electric_unit_price,
      electricAmount: bill.electric_amount,
      totalAmount: bill.total_amount,
    }
  }

  const wUnits = latest ? latest.water_current - latest.water_previous : 0
  const eUnits = latest ? latest.electric_current - latest.electric_previous : 0
  return {
    receiptNo,
    printDate: '2026-05-24',
    roomNumber,
    floor: history.floor,
    roomType: history.room_type,
    tenantName: history.tenant_name,
    billingMonth: latest?.billing_month ?? new Date().toISOString(),
    roomPrice: history.base_price,
    waterUnits: wUnits,
    waterUnitPrice: latest?.water_unit_price ?? 18,
    waterAmount: wUnits * (latest?.water_unit_price ?? 18),
    electricUnits: eUnits,
    electricUnitPrice: latest?.electric_unit_price ?? 7,
    electricAmount: eUnits * (latest?.electric_unit_price ?? 7),
    totalAmount: latest?.total_amount ?? history.base_price,
  }
}

// ── Single copy ───────────────────────────────────────────────
function ReceiptCopy({
  data,
  copyLabel,
  copyColor,
}: {
  data: ReceiptData
  copyLabel: string
  copyColor: string
}) {
  return (
    <div style={{
      width: '100%',
      padding: '14mm 16mm 10mm',
      boxSizing: 'border-box',
      fontFamily: 'var(--font-sans), "TH Sarabun New", "Sarabun", sans-serif',
      fontSize: '10pt',
      color: '#000',
      position: 'relative',
    }}>

      {/* Header */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6mm' }}>
        <tbody>
          <tr>
            <td style={{ width: '18mm', verticalAlign: 'middle', paddingRight: '4mm' }}>
              <div style={{
                width: '14mm', height: '14mm',
                borderRadius: '3mm',
                background: '#2e006b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Building2 style={{ width: '8mm', height: '8mm', color: '#ffd445' }} />
              </div>
            </td>
            <td style={{ verticalAlign: 'middle' }}>
              <div style={{ fontSize: '14pt', fontWeight: 'bold', color: '#2e006b', lineHeight: 1.2 }}>
                {DORM_INFO.school}
              </div>
              <div style={{ fontSize: '10pt', color: '#444', marginTop: '1mm' }}>
                {DORM_INFO.dorm} · {data.roomType}
              </div>
              <div style={{ fontSize: '8.5pt', color: '#666', marginTop: '0.5mm' }}>
                {DORM_INFO.address}
              </div>
              <div style={{ fontSize: '8.5pt', color: '#666' }}>
                โทรศัพท์ {DORM_INFO.phone} &nbsp;|&nbsp; โทรสาร {DORM_INFO.fax}
              </div>
            </td>
            <td style={{ width: '40mm', verticalAlign: 'top', textAlign: 'right' }}>
              <div style={{
                display: 'inline-block',
                border: '2px solid #2e006b',
                borderRadius: '2mm',
                padding: '2mm 4mm',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '11pt', fontWeight: 'bold', color: '#2e006b' }}>ใบเสร็จรับเงิน</div>
                <div style={{ fontSize: '7.5pt', color: '#555', marginTop: '1mm' }}>เลขที่ {data.receiptNo}</div>
                <div style={{ fontSize: '7.5pt', color: '#555' }}>วันที่ {formatDate(data.printDate)}</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Tenant info */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '4mm', fontSize: '9.5pt' }}>
        <tbody>
          <tr>
            <td style={{ width: '50%', paddingBottom: '1mm' }}>
              <span style={{ color: '#555' }}>ชื่อผู้เช่า: </span>
              <span style={{ fontWeight: 'bold' }}>{data.tenantName}</span>
            </td>
            <td style={{ paddingBottom: '1mm' }}>
              <span style={{ color: '#555' }}>ห้องที่: </span>
              <span style={{ fontWeight: 'bold' }}>ห้อง {data.roomNumber} (ชั้น {data.floor})</span>
            </td>
          </tr>
          <tr>
            <td>
              <span style={{ color: '#555' }}>รอบบิล: </span>
              <span style={{ fontWeight: 'bold' }}>{formatThaiMonth(data.billingMonth)}</span>
            </td>
            <td>
              <span style={{ color: '#555' }}>ประเภทห้อง: </span>
              <span style={{ fontWeight: 'bold' }}>{data.roomType}</span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Items table */}
      <table style={{
        width: '100%', borderCollapse: 'collapse',
        marginBottom: '3mm', fontSize: '9.5pt',
      }}>
        <thead>
          <tr style={{ background: '#f0ebff' }}>
            <th style={{ border: '1px solid #ccc', padding: '2mm 3mm', textAlign: 'left', fontWeight: 'bold', color: '#2e006b' }}>
              รายการ
            </th>
            <th style={{ border: '1px solid #ccc', padding: '2mm 3mm', textAlign: 'center', width: '22mm', fontWeight: 'bold', color: '#2e006b' }}>
              จำนวนหน่วย
            </th>
            <th style={{ border: '1px solid #ccc', padding: '2mm 3mm', textAlign: 'center', width: '20mm', fontWeight: 'bold', color: '#2e006b' }}>
              ราคา/หน่วย
            </th>
            <th style={{ border: '1px solid #ccc', padding: '2mm 3mm', textAlign: 'right', width: '22mm', fontWeight: 'bold', color: '#2e006b' }}>
              จำนวนเงิน (บาท)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '2mm 3mm' }}>ค่าเช่าห้องพัก</td>
            <td style={{ border: '1px solid #ccc', padding: '2mm 3mm', textAlign: 'center' }}>—</td>
            <td style={{ border: '1px solid #ccc', padding: '2mm 3mm', textAlign: 'center' }}>—</td>
            <td style={{ border: '1px solid #ccc', padding: '2mm 3mm', textAlign: 'right' }}>{data.roomPrice.toLocaleString()}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '2mm 3mm' }}>ค่าน้ำประปา</td>
            <td style={{ border: '1px solid #ccc', padding: '2mm 3mm', textAlign: 'center' }}>{data.waterUnits}</td>
            <td style={{ border: '1px solid #ccc', padding: '2mm 3mm', textAlign: 'center' }}>{data.waterUnitPrice.toFixed(2)}</td>
            <td style={{ border: '1px solid #ccc', padding: '2mm 3mm', textAlign: 'right' }}>{data.waterAmount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '2mm 3mm' }}>ค่าไฟฟ้า</td>
            <td style={{ border: '1px solid #ccc', padding: '2mm 3mm', textAlign: 'center' }}>{data.electricUnits}</td>
            <td style={{ border: '1px solid #ccc', padding: '2mm 3mm', textAlign: 'center' }}>{data.electricUnitPrice.toFixed(2)}</td>
            <td style={{ border: '1px solid #ccc', padding: '2mm 3mm', textAlign: 'right' }}>{data.electricAmount.toLocaleString()}</td>
          </tr>
          {/* Total */}
          <tr style={{ background: '#fafafa' }}>
            <td colSpan={3} style={{ border: '1px solid #ccc', padding: '2.5mm 3mm', textAlign: 'right', fontWeight: 'bold', color: '#2e006b' }}>
              รวมทั้งสิ้น
            </td>
            <td style={{ border: '1px solid #ccc', padding: '2.5mm 3mm', textAlign: 'right', fontWeight: 'bold', fontSize: '11pt', color: '#2e006b' }}>
              {data.totalAmount.toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Amount in words */}
      <div style={{
        border: '1px solid #ccc',
        borderRadius: '2mm',
        padding: '2mm 4mm',
        marginBottom: '5mm',
        fontSize: '9.5pt',
        background: '#fafafa',
      }}>
        <span style={{ color: '#555' }}>จำนวนเงิน (ตัวอักษร): </span>
        <span style={{ fontWeight: 'bold' }}>{bahtText(data.totalAmount)}</span>
      </div>

      {/* Signatures */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
        <tbody>
          <tr>
            <td style={{ width: '50%', textAlign: 'center', paddingTop: '8mm' }}>
              <div style={{ borderTop: '1px solid #999', width: '55mm', margin: '0 auto', paddingTop: '2mm' }}>
                <div>ลายมือชื่อ .................................................</div>
                <div style={{ marginTop: '1mm', color: '#555' }}>( ผู้รับเงิน / เจ้าหน้าที่ )</div>
                <div style={{ marginTop: '1mm', color: '#777', fontSize: '8.5pt' }}>
                  วันที่ ........./........./.........
                </div>
              </div>
            </td>
            <td style={{ width: '50%', textAlign: 'center', paddingTop: '8mm' }}>
              <div style={{ borderTop: '1px solid #999', width: '55mm', margin: '0 auto', paddingTop: '2mm' }}>
                <div>ลายมือชื่อ .................................................</div>
                <div style={{ marginTop: '1mm', color: '#555' }}>( ผู้ชำระเงิน / ผู้เช่า )</div>
                <div style={{ marginTop: '1mm', color: '#777', fontSize: '8.5pt' }}>
                  วันที่ ........./........./.........
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────
export function ReceiptPrint({ roomNumber }: { roomNumber: string }) {
  const data = buildReceiptData(roomNumber)

  return (
    <>
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { margin: 0 !important; background: white !important; }
          .no-print { display: none !important; }
          #print-container { display: block !important; }
          .receipt-copy {
            width: 210mm;
            min-height: 297mm;
            background: white;
            page-break-after: always;
          }
          .receipt-copy:last-child {
            page-break-after: avoid;
          }
        }
      ` }} />

      {/* Print-only: 2 full A4 pages */}
      {/* <div style={{ display: 'none' }} aria-hidden="true" id="print-container">
        <div className="receipt-copy" style={{ width: '210mm', minHeight: '297mm', background: 'white' }}>
          <ReceiptCopy data={data} copyLabel="สำเนาผู้เช่า" copyColor="#7c3aed" />
        </div>
        <div className="receipt-copy" style={{ width: '210mm', minHeight: '297mm', background: 'white' }}>
          <ReceiptCopy data={data} copyLabel="สำเนาธุรการ" copyColor="#0284c7" />
        </div>
      </div> */}

      {/* Screen toolbar */}
      <div className="no-print sticky top-0 z-30 flex items-center gap-3 px-5 py-3 shadow-md"
        style={{ background: '#2e006b' }}>
        <Link href="/bills">
          <button className="flex items-center justify-center w-8 h-8 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <span className="text-white font-bold text-sm flex-1">
          ใบเสร็จรับเงิน — ห้อง {roomNumber}
        </span>
        <span className="text-white/55 text-xs hidden sm:block">กระดาษ A4 · 2 สำเนา</span>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: '#ffd445', color: '#2e006b' }}
        >
          <Printer className="w-4 h-4" />
          พิมพ์
        </button>
      </div>

      {/* Screen preview — 2 A4 sheets stacked */}
      <div className="no-print flex flex-col items-center gap-6 py-6 px-4" style={{ background: '#e5e7eb', minHeight: 'calc(100vh - 52px)' }}>

        {/* Sheet 1 — ผู้เช่า */}
        <div>
          <p className="text-xs text-gray-500 mb-2 text-center font-medium">หน้าที่ 1 — สำหรับผู้เช่า</p>
          <div className="receipt-page bg-white shadow-2xl" style={{ width: '210mm', minHeight: '297mm' }}>
            <ReceiptCopy data={data} copyLabel="สำเนาผู้เช่า" copyColor="#7c3aed" />
          </div>
        </div>

        {/* Sheet 2 — ธุรการ */}
        <div>
          <p className="text-xs text-gray-500 mb-2 text-center font-medium">หน้าที่ 2 — สำหรับธุรการ</p>
          <div className="receipt-page bg-white shadow-2xl" style={{ width: '210mm', minHeight: '297mm' }}>
            <ReceiptCopy data={data} copyLabel="สำเนาธุรการ" copyColor="#0284c7" />
          </div>
        </div>

      </div>
    </>
  )
}
