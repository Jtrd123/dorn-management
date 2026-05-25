const ONES = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
const PLACES = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน']

function groupToThai(n: number): string {
  if (n === 0) return ''
  const s = n.toString().padStart(6, '0').slice(-6)
  let result = ''
  for (let i = 0; i < 6; i++) {
    const d = parseInt(s[i])
    const place = 5 - i
    if (d === 0) continue
    if (place === 1) {
      if (d === 1) result += 'สิบ'
      else if (d === 2) result += 'ยี่สิบ'
      else result += ONES[d] + 'สิบ'
    } else {
      result += ONES[d] + PLACES[place]
    }
  }
  return result
}

export function bahtText(amount: number): string {
  const int = Math.floor(amount)
  const dec = Math.round((amount - int) * 100)

  let text = ''
  if (int === 0) {
    text = 'ศูนย์บาท'
  } else if (int >= 1_000_000) {
    const m = Math.floor(int / 1_000_000)
    const rem = int % 1_000_000
    text = groupToThai(m) + 'ล้าน' + groupToThai(rem) + 'บาท'
  } else {
    text = groupToThai(int) + 'บาท'
  }

  if (dec > 0) return text + groupToThai(dec) + 'สตางค์'
  return text + 'ถ้วน'
}
