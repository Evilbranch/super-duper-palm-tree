import { useEffect } from 'react';

export function useWakeLock(isActive: boolean) {
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    const acquire = async () => {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
          // screen lock released (e.g., user switched tabs)
        });
      } catch {
        // Wake Lock API not supported — graceful degradation
      }
    };

    if (isActive) acquire();

    return () => {
      wakeLock?.release().catch(() => {});
    };
  }, [isActive]);
}
