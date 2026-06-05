import { formatPrice } from '../../data/services';

interface PromoPriceDisplayProps {
  subtotal: number;
  total: number;
  size?: 'md' | 'lg';
}

export function PromoPriceDisplay({ subtotal, total, size = 'md' }: PromoPriceDisplayProps) {
  const discounted = total < subtotal;
  const priceClass = size === 'lg' ? 'text-4xl' : 'text-3xl';

  if (!discounted) {
    return <p className={`${priceClass} font-bold text-white`}>{formatPrice(subtotal)}</p>;
  }

  return (
    <div className="flex flex-wrap items-baseline gap-3">
      <span
        className={`${size === 'lg' ? 'text-2xl' : 'text-xl'} font-semibold text-white/40 line-through decoration-white/30`}
        aria-hidden="true"
      >
        {formatPrice(subtotal)}
      </span>
      <span className={`${priceClass} font-bold text-emerald-400`}>{formatPrice(total)}</span>
      <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
        10% off
      </span>
    </div>
  );
}
