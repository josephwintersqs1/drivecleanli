import { useRef, useState } from 'react';
import { formatStreetSummary, withLine2 } from '../../lib/format-address';
import { getGoogleMapsApiKey } from '../../lib/google-maps-env';
import { useAddressSuggestions } from '../../hooks/useAddressSuggestions';
import type { ServiceAddress } from '../../types/address';
import { bookingInputClass } from './booking-styles';

interface AddressAutocompleteProps {
  value: ServiceAddress | null;
  onChange: (address: ServiceAddress | null) => void;
  onBlurValidate?: () => void;
  error?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onBlurValidate,
  error,
}: AddressAutocompleteProps) {
  const listId = useRef(`address-suggestions-${Math.random().toString(36).slice(2, 9)}`);
  const [changingAddress, setChangingAddress] = useState(false);
  const apiKey = getGoogleMapsApiKey();
  const searchMode = !value || changingAddress;

  const {
    query,
    setQuery,
    suggestions,
    open,
    setOpen,
    loadError,
    ready,
    searching,
    selectSuggestion,
    resetSearch,
    predictionLabel,
  } = useAddressSuggestions(apiKey, searchMode);

  if (!apiKey?.trim()) {
    return (
      <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        Add <code className="text-amber-100">PUBLIC_GOOGLE_MAPS_API_KEY</code> to{' '}
        <code className="text-amber-100">.env</code>, then restart the dev server.
      </p>
    );
  }

  const showValidation = Boolean(error) && !loadError;

  const beginChangeAddress = () => {
    onChange(null);
    setChangingAddress(true);
    resetSearch();
  };

  const handleSelect = (suggestion: google.maps.places.AutocompleteSuggestion) => {
    void selectSuggestion(suggestion).then((mapped) => {
      if (mapped) {
        setChangingAddress(false);
        onChange(mapped);
      }
    });
  };

  return (
    <div className="space-y-3">
      {searchMode ? (
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setOpen(true);
            }}
            onBlur={(e) => {
              if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node | null)) {
                setOpen(false);
                onBlurValidate?.();
              }
            }}
            className={bookingInputClass}
            placeholder="Search street address…"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            name="driveclean-address-search"
            id="driveclean-address-search"
            data-1p-ignore="true"
            data-lpignore="true"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={listId.current}
            aria-busy={searching}
            disabled={!ready && !loadError}
          />

          {open && suggestions.length > 0 && (
            <ul
              id={listId.current}
              role="listbox"
              className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-white/15 bg-neutral-900 py-1 shadow-xl"
            >
              {suggestions.map((suggestion, index) => {
                const prediction = suggestion.placePrediction;
                if (!prediction) return null;
                return (
                  <li key={`${prediction.placeId}-${index}`} role="presentation">
                    <button
                      type="button"
                      role="option"
                      className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/10 focus:bg-white/10 focus:outline-none"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelect(suggestion)}
                    >
                      {predictionLabel(prediction)}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {!value && ready && !loadError && query.trim().length >= 3 && !open && !searching && (
            <p className="mt-2 text-xs text-white/45">Select an address from the list.</p>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3">
          <p className="text-sm font-medium text-white">{formatStreetSummary(value)}</p>
          <p className="mt-0.5 text-sm text-white/55">
            {value.city}, {value.state} {value.zip}
          </p>
          <button
            type="button"
            onClick={beginChangeAddress}
            className="mt-2 text-xs font-medium text-red-400 underline-offset-2 hover:text-red-300 hover:underline"
          >
            Change address
          </button>
        </div>
      )}

      {value && !searchMode && (
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-white/80">
            Apt / suite / unit{' '}
            <span className="font-normal text-white/45">(optional)</span>
          </span>
          <input
            type="text"
            value={value.line2 ?? ''}
            onChange={(e) => onChange(withLine2(value, e.target.value))}
            className={bookingInputClass}
            placeholder="Apt 4B, Suite 200, Unit 12…"
            autoComplete="address-line2"
            name="address-line2"
            maxLength={80}
          />
        </label>
      )}

      {loadError && (
        <div className="space-y-2 text-sm text-amber-300" role="alert">
          <p>{loadError}</p>
        </div>
      )}

      {showValidation && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
