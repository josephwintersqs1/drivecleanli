import { useEffect, useState } from 'react';
import { formatPrice } from '../../data/services';
import { getBookingPriceSummary, TIKTOK_PROMO_PERCENT } from '../../lib/tiktok-promo';
import {
  bookingCardDefault,
  bookingCardSelected,
} from './booking-styles';
import { PromoPriceDisplay } from './PromoPriceDisplay';
import { TikTokPromoHero } from './TikTokPromoHero';

interface PromoStepProps {
  serviceId: string;
  vehicleTierId: string;
  addOnIds: string[];
  tiktokPromo: boolean | null;
  onSelect: (accepted: boolean) => void;
}

export function PromoStep({
  serviceId,
  vehicleTierId,
  addOnIds,
  tiktokPromo,
  onSelect,
}: PromoStepProps) {
  const [celebrate, setCelebrate] = useState(false);
  const { subtotal, total: discountedTotal, discountAmount: promoSavings } =
    getBookingPriceSummary(serviceId, vehicleTierId, addOnIds, 'full', true);
  const accepted = tiktokPromo === true;

  useEffect(() => {
    if (!accepted) {
      setCelebrate(false);
      return;
    }
    setCelebrate(true);
    const timer = window.setTimeout(() => setCelebrate(false), 2000);
    return () => window.clearTimeout(timer);
  }, [accepted]);

  const handleYes = () => {
    onSelect(true);
    setCelebrate(true);
  };

  return (
    <div>
      <TikTokPromoHero celebrate={celebrate} />

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleYes}
          className={`rounded-2xl border-2 p-5 text-left transition ${
            tiktokPromo === true ? bookingCardSelected : bookingCardDefault
          }`}
        >
          <span className="block text-lg font-semibold text-white">Yes — I&apos;ll share!</span>
          <span className="mt-2 block text-sm text-emerald-300">
            Unlock {formatPrice(promoSavings)} off ({TIKTOK_PROMO_PERCENT}% discount)
          </span>
        </button>
        <button
          type="button"
          onClick={() => onSelect(false)}
          className={`rounded-2xl border-2 p-5 text-left transition ${
            tiktokPromo === false ? bookingCardSelected : bookingCardDefault
          }`}
        >
          <span className="block text-lg font-semibold text-white">No thanks</span>
          <span className="mt-2 block text-sm text-white/50">Continue at regular price</span>
        </button>
      </div>

      <div
        className={`mt-8 rounded-2xl border px-6 py-5 transition ${
          accepted
            ? 'border-emerald-500/40 bg-emerald-500/10'
            : 'border-white/10 bg-white/[0.03]'
        }`}
        aria-live="polite"
      >
        <p className="text-sm font-medium text-white/60">Your price today</p>
        <div className="mt-2">
          <PromoPriceDisplay
            subtotal={subtotal}
            total={accepted ? discountedTotal : subtotal}
            size="lg"
          />
        </div>
        {accepted && (
          <p className="mt-3 text-sm text-emerald-200/90">
            Discount applied — you save {formatPrice(promoSavings)}!
          </p>
        )}
        {tiktokPromo === null && (
          <p className="mt-3 text-sm text-white/45">Choose an option above to continue.</p>
        )}
      </div>
    </div>
  );
}
