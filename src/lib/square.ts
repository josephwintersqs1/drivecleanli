import { SquareClient, SquareEnvironment } from 'square';
import {
  buildBookingConfirmationSnapshot,
  encodeConfirmationForRedirect,
} from '../adapters/bookingConfirmation';
import {
  buildSquareOrderMetadata,
  expandSquareOrderMetadata,
} from '../adapters/squareOrderMetadata';
import type { BookingPayload } from '../types/booking';
import { buildBookingLineItems, type BookingLineItem } from '../data/services';
import { getBookingPriceSummary, TIKTOK_PROMO_PERCENT } from './tiktok-promo';

export function getSquareClient(): SquareClient {
  const token = import.meta.env.SQUARE_ACCESS_TOKEN;
  if (!token) {
    throw new Error('SQUARE_ACCESS_TOKEN is not configured');
  }

  return new SquareClient({
    token,
    environment:
      import.meta.env.PROD
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
  });
}

export async function createPaymentLink(
  booking: BookingPayload
): Promise<string> {
  const locationId = import.meta.env.SQUARE_LOCATION_ID;
  if (!locationId) {
    throw new Error('SQUARE_LOCATION_ID is not configured');
  }

  const { total, discountAmount, dueToday, balanceDue } = getBookingPriceSummary(
    booking.serviceId,
    booking.vehicleTierId,
    booking.addOnIds,
    booking.paymentMode,
    booking.tiktokPromo
  );

  const fullLineItems = buildBookingLineItems(
    booking.serviceId,
    booking.vehicleTierId,
    booking.addOnIds
  );

  const chargeLineItems =
    booking.tiktokPromo && discountAmount > 0
      ? scaleLineItemsToTotalCents(fullLineItems, total * 100)
      : fullLineItems;

  let lineItems;

  if (booking.paymentMode === 'deposit') {
    lineItems = [
      {
        name: booking.tiktokPromo
          ? `50% deposit (${TIKTOK_PROMO_PERCENT}% TikTok promo applied) — balance ${formatUsd(balanceDue)} due on service day`
          : `50% deposit — balance ${formatUsd(balanceDue)} due on service day`,
        quantity: '1',
        basePriceMoney: {
          amount: BigInt(dueToday * 100),
          currency: 'USD',
        },
      },
    ];
  } else {
    lineItems = chargeLineItems.map((item) => ({
      name: item.name,
      quantity: '1',
      basePriceMoney: {
        amount: BigInt(item.amountCents),
        currency: 'USD',
      },
    }));
  }

  const client = getSquareClient();
  const idempotencyKey = crypto.randomUUID();
  const siteUrl = import.meta.env.SITE_URL ?? 'http://localhost:4321';
  const confirmationToken = encodeConfirmationForRedirect(
    buildBookingConfirmationSnapshot(booking)
  );

  const response = await client.checkout.paymentLinks.create({
    idempotencyKey,
    order: {
      locationId,
      lineItems,
      metadata: buildSquareOrderMetadata(booking),
    },
    checkoutOptions: {
      redirectUrl: `${siteUrl}/book?confirmed=1&payment=${booking.paymentMode}&d=${confirmationToken}`,
    },
    paymentNote: `DriveClean: ${booking.firstName} ${booking.lastName}${
      booking.paymentMode === 'deposit' ? ' (50% deposit)' : ''
    }${booking.tiktokPromo ? ' · TikTok promo' : ''}`,
  });

  const url = response.paymentLink?.url ?? response.paymentLink?.longUrl;
  if (!url) {
    throw new Error('Square did not return a payment link URL');
  }

  return url;
}

function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Square requires non-negative line items; spread promo discount across items. */
function scaleLineItemsToTotalCents(
  items: BookingLineItem[],
  targetTotalCents: number
): BookingLineItem[] {
  const subtotalCents = items.reduce((sum, item) => sum + item.amountCents, 0);
  if (subtotalCents === 0 || subtotalCents === targetTotalCents) return items;

  const scaled = items.map((item) => ({
    ...item,
    amountCents: Math.round((item.amountCents * targetTotalCents) / subtotalCents),
  }));

  const sum = scaled.reduce((total, item) => total + item.amountCents, 0);
  const diff = targetTotalCents - sum;
  if (diff !== 0 && scaled.length > 0) {
    scaled[0] = {
      ...scaled[0],
      amountCents: Math.max(0, scaled[0].amountCents + diff),
    };
  }

  return scaled;
}

/** Booking fields stored on the Square order at checkout. */
export async function getOrderBookingMetadata(
  orderId: string
): Promise<Record<string, string> | null> {
  const client = getSquareClient();
  const response = await client.orders.get({ orderId });
  const raw = response.order?.metadata;
  if (!raw) return null;

  const metadata: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value != null && value !== '') metadata[key] = value;
  }
  if (Object.keys(metadata).length === 0) return null;
  return expandSquareOrderMetadata(metadata);
}
