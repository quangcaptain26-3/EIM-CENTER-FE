/** Chuyển số tiền VND sang chữ (đồng bộ logic BE). */

const ONES = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

const TEENS = [
  'mười',
  'mười một',
  'mười hai',
  'mười ba',
  'mười bốn',
  'mười lăm',
  'mười sáu',
  'mười bảy',
  'mười tám',
  'mười chín',
];

function threeDigits(n: number): string {
  if (n === 0) return '';

  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;
  const tens = Math.floor(remainder / 10);
  const ones = remainder % 10;

  const parts: string[] = [];

  if (hundreds > 0) {
    parts.push(`${ONES[hundreds]} trăm`);
  }

  if (remainder === 0) {
    // nothing
  } else if (remainder < 10) {
    parts.push(`lẻ ${ONES[ones]}`);
  } else if (remainder < 20) {
    parts.push(TEENS[remainder - 10]);
  } else {
    let tensWord = `${ONES[tens]} mươi`;
    if (ones === 0) {
      // hai mươi
    } else if (ones === 1) {
      tensWord += ' mốt';
    } else if (ones === 5) {
      tensWord += ' lăm';
    } else {
      tensWord += ` ${ONES[ones]}`;
    }
    parts.push(tensWord);
  }

  return parts.join(' ');
}

export function amountToWordsVi(amount: number): string {
  if (!Number.isFinite(amount)) return '';

  const isNegative = amount < 0;
  const abs = Math.abs(Math.round(amount));

  if (abs === 0) return 'Không đồng';

  const dong = abs % 1_000;
  const nghin = Math.floor(abs / 1_000) % 1_000;
  const trieu = Math.floor(abs / 1_000_000) % 1_000;
  const ty = Math.floor(abs / 1_000_000_000);

  const parts: string[] = [];

  if (ty > 0) parts.push(`${threeDigits(ty)} tỷ`);
  if (trieu > 0) parts.push(`${threeDigits(trieu)} triệu`);
  if (nghin > 0) parts.push(`${threeDigits(nghin)} nghìn`);
  if (dong > 0) parts.push(threeDigits(dong));

  let result = parts.join(' ');
  result = result.charAt(0).toUpperCase() + result.slice(1);
  const suffix = dong === 0 ? 'đồng chẵn' : 'đồng';
  result = `${result} ${suffix}`;
  if (isNegative) result = `Âm ${result.charAt(0).toLowerCase()}${result.slice(1)}`;

  return result;
}
