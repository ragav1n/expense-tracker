'use client';

import { useState, useEffect } from 'react';

/**
 * Returns true when the app is running inside a Capacitor native shell
 * (i.e. on a real iOS/Android device or simulator), false in a browser.
 *
 * Safe to use server-side (returns false during SSR).
 */
export function useIsNative(): boolean {
    const [isNative, setIsNative] = useState(false);

    useEffect(() => {
        // Capacitor injects this global when running in a native shell
        const cap = (window as any).Capacitor;
        console.log('[useIsNative] Capacitor window object found:', !!cap);
        if (cap) {
            console.log('[useIsNative] cap.isNative:', cap.isNative);
            setIsNative(!!cap.isNative);
        } else {
            setIsNative(false);
        }
    }, []);

    return isNative;
}
