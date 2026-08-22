'use client';

import { useSyncExternalStore } from 'react';

export const MOBILE_MEDIA_QUERY = '(max-width: 767px)';

function subscribeToViewport(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};
  const media = window.matchMedia(MOBILE_MEDIA_QUERY);
  media.addEventListener('change', onStoreChange);
  return () => media.removeEventListener('change', onStoreChange);
}

function isMobileViewport() {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

export function useIsMobileViewport() {
  return useSyncExternalStore(subscribeToViewport, isMobileViewport, () => false);
}
