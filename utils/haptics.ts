/**
 * Haptic feedback utility for PWA tactile responses.
 *
 * Wraps Sonner's `toast` to automatically trigger `navigator.vibrate` on
 * every `toast.success` call. Works natively on Android Chrome; gracefully
 * degrades on iOS Safari (which doesn't support the Vibration API).
 *
 * Usage: replace `import { toast } from 'sonner'`
 *        with    `import { toast } from '@/utils/haptics'`
 */

import { toast as sonnerToast } from 'sonner';
import type { ExternalToast } from 'sonner';

// ---------------------------------------------------------------------------
// Vibration patterns (milliseconds)
// ---------------------------------------------------------------------------
const PATTERNS = {
    /** Single short click — confirms a successful action */
    success: [10] as number[],
} as const;

function vibrate(pattern: number[]) {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
            navigator.vibrate(pattern);
        } catch {
            // Silently ignore — some browsers expose the API but restrict usage
        }
    }
}

// ---------------------------------------------------------------------------
// Drop-in replacement for Sonner's `toast`
// ---------------------------------------------------------------------------
type MessageArg = Parameters<typeof sonnerToast>[0];

function toastFn(message: MessageArg, options?: ExternalToast) {
    return sonnerToast(message, options);
}

// Forward all static methods from Sonner, override `success`
toastFn.success = (message: MessageArg, options?: ExternalToast) => {
    vibrate(PATTERNS.success);
    return sonnerToast.success(message, options);
};

toastFn.error = sonnerToast.error.bind(sonnerToast);
toastFn.warning = sonnerToast.warning.bind(sonnerToast);
toastFn.info = sonnerToast.info.bind(sonnerToast);
toastFn.loading = sonnerToast.loading.bind(sonnerToast);
toastFn.promise = sonnerToast.promise.bind(sonnerToast);
toastFn.dismiss = sonnerToast.dismiss.bind(sonnerToast);
toastFn.custom = sonnerToast.custom.bind(sonnerToast);
toastFn.message = sonnerToast.message.bind(sonnerToast);

export { toastFn as toast };
