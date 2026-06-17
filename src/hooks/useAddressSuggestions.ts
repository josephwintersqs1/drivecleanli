import { useCallback, useEffect, useRef, useState } from 'react';
import { placeToAddressFromPlace } from '../adapters/placeToAddress';
import {
  describeGooglePlacesError,
  GOOGLE_PLACES_SETUP_MESSAGE,
} from '../lib/google-places-errors';
import { loadGooglePlacesLibrary } from '../lib/load-google-places';
import type { ServiceAddress } from '../types/address';

function predictionLabel(prediction: google.maps.places.PlacePrediction): string {
  return prediction.text?.text ?? prediction.text?.toString() ?? '';
}

export function useAddressSuggestions(apiKey: string | undefined, searchEnabled = true) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [ready, setReady] = useState(false);
  const [searching, setSearching] = useState(false);

  const sessionRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const placesRef = useRef<google.maps.PlacesLibrary | null>(null);

  const newSession = useCallback(() => {
    if (!placesRef.current) return;
    sessionRef.current = new placesRef.current.AutocompleteSessionToken();
  }, []);

  useEffect(() => {
    const previous = window.gm_authFailure;
    window.gm_authFailure = () => {
      setLoadError(GOOGLE_PLACES_SETUP_MESSAGE);
      setReady(false);
    };
    return () => {
      window.gm_authFailure = previous;
    };
  }, []);

  useEffect(() => {
    if (!apiKey) return;

    let cancelled = false;

    void (async () => {
      try {
        const places = await loadGooglePlacesLibrary(apiKey);
        if (cancelled) return;
        placesRef.current = places;
        newSession();
        setLoadError('');
        setReady(true);
      } catch (err) {
        if (!cancelled) {
          setLoadError(describeGooglePlacesError(err));
          setReady(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [apiKey, newSession]);

  useEffect(() => {
    if (!apiKey || !ready || !placesRef.current || !searchEnabled) return;

    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const requestId = ++requestIdRef.current;
      setSearching(true);

      void (async () => {
        try {
          if (!sessionRef.current) newSession();
          const { suggestions: next } =
            await placesRef.current!.AutocompleteSuggestion.fetchAutocompleteSuggestions({
              input: trimmed,
              includedRegionCodes: ['us'],
              sessionToken: sessionRef.current ?? undefined,
            });

          if (requestId !== requestIdRef.current) return;

          setSuggestions(next);
          setOpen(next.length > 0);
          setLoadError('');
        } catch (err) {
          if (requestId !== requestIdRef.current) return;
          setSuggestions([]);
          setOpen(false);
          setLoadError(describeGooglePlacesError(err));
        } finally {
          if (requestId === requestIdRef.current) setSearching(false);
        }
      })();
    }, 280);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [apiKey, query, ready, newSession, searchEnabled]);

  useEffect(() => {
    if (!searchEnabled) {
      setSuggestions([]);
      setOpen(false);
      setSearching(false);
    }
  }, [searchEnabled]);

  const selectSuggestion = useCallback(
    async (suggestion: google.maps.places.AutocompleteSuggestion): Promise<ServiceAddress | null> => {
      const prediction = suggestion.placePrediction;
      if (!prediction) return null;

      setQuery('');
      setOpen(false);
      setSuggestions([]);

      try {
        const place = prediction.toPlace();
        await place.fetchFields({
          fields: ['addressComponents', 'formattedAddress', 'id'],
        });
        const mapped = placeToAddressFromPlace(place);
        newSession();
        return mapped;
      } catch (err) {
        setLoadError(describeGooglePlacesError(err));
        return null;
      }
    },
    [newSession]
  );

  const resetSearch = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setOpen(false);
    setLoadError('');
  }, []);

  return {
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
  };
}
