import { calculatePrice, getCheckoutAmounts, type PaymentMode } from '../data/services';

export const TIKTOK_PROMO_PERCENT = 10;

export function applyTikTokPromoDiscount(subtotal: number, accepted: boolean): number {
  if (!accepted) return subtotal;
  return Math.round(subtotal * (100 - TIKTOK_PROMO_PERCENT) / 100);
}

export function getBookingPriceSummary(
  serviceId: string,
  vehicleTierId: string,
  addOnIds: string[],
  paymentMode: PaymentMode,
  tiktokPromo: boolean
) {
  const subtotal = calculatePrice(serviceId, vehicleTierId, addOnIds);
  const total = applyTikTokPromoDiscount(subtotal, tiktokPromo);
  const discountAmount = subtotal - total;
  const { dueToday, balanceDue } = getCheckoutAmounts(total, paymentMode);

  return { subtotal, total, discountAmount, dueToday, balanceDue, tiktokPromo };
}
