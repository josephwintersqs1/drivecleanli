import { useState } from 'react';
import {
  formatUSPhoneAsYouType,
  NOTES_MAX_LENGTH,
  validateEmail,
  validateUSPhone,
} from '../../lib/validate-contact';
import type { ServiceAddress } from '../../types/address';
import { AddressAutocomplete } from './AddressAutocomplete';
import {
  bookingHeadingClass,
  bookingInputClass,
  bookingSubtextClass,
} from './booking-styles';

interface ContactStepProps {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  serviceAddress: ServiceAddress | null;
  notes: string;
  onChange: (
    field: 'firstName' | 'lastName' | 'phone' | 'email' | 'serviceAddress' | 'notes',
    value: string | ServiceAddress | null
  ) => void;
  showErrors?: boolean;
}

export function ContactStep({
  firstName,
  lastName,
  phone,
  email,
  serviceAddress,
  notes,
  onChange,
  showErrors = false,
}: ContactStepProps) {
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [addressTouched, setAddressTouched] = useState(false);

  const phoneInvalid =
    (showErrors || phoneTouched) && phone.trim() && !validateUSPhone(phone);
  const phoneRequired = (showErrors || phoneTouched) && !phone.trim();
  const emailInvalid =
    (showErrors || emailTouched) && email.trim() && !validateEmail(email);
  const emailRequired = (showErrors || emailTouched) && !email.trim();
  const addressRequired = (showErrors || addressTouched) && !serviceAddress;

  return (
    <div>
      <h2 className={bookingHeadingClass}>Your details</h2>
      <p className={bookingSubtextClass}>
        We come to you — search for your street address, add apt/unit if needed, then contact info.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-1 block text-sm font-semibold text-white/80">First name</span>
          <input
            type="text"
            value={firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            className={bookingInputClass}
            required
            autoComplete="given-name"
          />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold text-white/80">Last name</span>
          <input
            type="text"
            value={lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            className={bookingInputClass}
            required
            autoComplete="family-name"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-1 block text-sm font-semibold text-white/80">Phone</span>
        <input
          type="tel"
          value={phone}
          onChange={(e) => onChange('phone', formatUSPhoneAsYouType(e.target.value))}
          onBlur={() => setPhoneTouched(true)}
          className={bookingInputClass}
          placeholder="(631) 555-1234"
          required
          autoComplete="tel"
          inputMode="tel"
          aria-invalid={phoneInvalid || phoneRequired}
        />
        {phoneRequired && (
          <p className="mt-2 text-sm text-red-400" role="alert">
            Phone number is required.
          </p>
        )}
        {phoneInvalid && (
          <p className="mt-2 text-sm text-red-400" role="alert">
            Enter a valid US phone number.
          </p>
        )}
      </label>

      <label className="mt-4 block">
        <span className="mb-1 block text-sm font-semibold text-white/80">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => onChange('email', e.target.value)}
          onBlur={() => setEmailTouched(true)}
          className={bookingInputClass}
          placeholder="you@example.com"
          required
          autoComplete="email"
          aria-invalid={emailInvalid || emailRequired}
        />
        {emailRequired && (
          <p className="mt-2 text-sm text-red-400" role="alert">
            Email is required for confirmation and reminders.
          </p>
        )}
        {emailInvalid && (
          <p className="mt-2 text-sm text-red-400" role="alert">
            Enter a valid email address.
          </p>
        )}
      </label>

      <div className="mt-4">
        <span className="mb-1 block text-sm font-semibold text-white/80">
          Service address
        </span>
        <AddressAutocomplete
          value={serviceAddress}
          onChange={(addr) => onChange('serviceAddress', addr)}
          onBlurValidate={() => setAddressTouched(true)}
          error={
            addressRequired
              ? 'Select a valid US address from the suggestions.'
              : undefined
          }
        />
      </div>

      <label className="mt-4 block">
        <span className="mb-1 block text-sm font-semibold text-white/80">
          Notes <span className="font-normal text-white/45">(optional)</span>
        </span>
        <textarea
          value={notes}
          onChange={(e) => onChange('notes', e.target.value)}
          className={`${bookingInputClass} min-h-[100px] resize-y`}
          placeholder="Gate code, pets, special requests…"
          maxLength={NOTES_MAX_LENGTH}
          rows={4}
        />
        <p className="mt-1 text-right text-xs text-white/40">
          {notes.length}/{NOTES_MAX_LENGTH}
        </p>
      </label>
    </div>
  );
}
