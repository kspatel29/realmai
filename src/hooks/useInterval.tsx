
import { useEffect, useRef } from 'react';

/**
 * Custom hook for setting intervals
 * @param callback - Function to call on each interval
 * @param delay - Delay in ms (null to pause)
 * @param immediate - Whether to run the callback immediately on mount
 */
export function useInterval(callback: () => void, delay: number | null, immediate: boolean = false) {
  const savedCallback = useRef<() => void>(() => {});

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    // Run immediately if requested
    if (immediate && delay !== null) {
      tick();
    }

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
    
    // Return nothing if delay is null (paused)
    return undefined;
  }, [delay, immediate]);
}
