import { amountToWordsVi } from '@/shared/utils/amount-to-words';

interface AmountInWordsProps {
  amount: number;
  className?: string;
}

export function AmountInWords({ amount, className = '' }: AmountInWordsProps) {
  const text = Number.isFinite(amount) && amount !== 0 ? amountToWordsVi(amount) : '—';
  return (
    <p className={`text-sm text-gray-600 ${className}`}>
      <span className="font-medium text-gray-500">Bằng chữ: </span>
      {text}
    </p>
  );
}
