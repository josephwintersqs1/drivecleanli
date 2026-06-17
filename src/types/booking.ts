import type { PaymentMode } from '../data/services';
import type { ServiceAddress } from './address';

export interface BookingPayload {
  serviceId: string;
  vehicleTierId: string;
  addOnIds: string[];
  paymentMode: PaymentMode;
  slotStart: string;
  slotEnd: string;
  firstName: string;
  lastName: string;
  phone: string;
  /** E.164 format, e.g. +16317645337 */
  address: ServiceAddress;
  notes: string;
  /** Customer opted into post-appointment TikTok share for 10% off */
  tiktokPromo: boolean;
}

export interface BookingState {
  step: number;
  serviceId: string;
  vehicleTierId: string;
  addOnIds: string[];
  paymentMode: PaymentMode;
  slotStart: string;
  slotEnd: string;
  firstName: string;
  lastName: string;
  phone: string;
  serviceAddress: ServiceAddress | null;
  notes: string;
  /** null until user answers the promo step */
  tiktokPromo: boolean | null;
}

export const initialBookingState: BookingState = {
  step: 1,
  serviceId: '',
  vehicleTierId: '',
  addOnIds: [],
  paymentMode: 'full',
  slotStart: '',
  slotEnd: '',
  firstName: '',
  lastName: '',
  phone: '',
  serviceAddress: null,
  notes: '',
  tiktokPromo: null,
};
