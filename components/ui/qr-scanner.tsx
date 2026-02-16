'use client';

import { Scanner } from '@yudiel/react-qr-scanner';
import { cn } from '@/lib/utils';
import { Loader2, CameraOff } from 'lucide-react';

interface QrScannerProps {
    onScan: (result: string) => void;
    onError?: (error: unknown) => void;
    className?: string;
}

export function QrScanner({ onScan, onError, className }: QrScannerProps) {
    return (
        <div className={cn("relative w-full aspect-square overflow-hidden rounded-xl bg-black", className)}>
            <Scanner
                onScan={(result: { rawValue: string }[]) => {
                    if (result && result.length > 0) {
                        onScan(result[0].rawValue);
                    }
                }}
                onError={(err: unknown) => {
                    console.error("QR Scan Error:", err);
                    if (onError) onError(err);
                }}
                styles={{
                    container: {
                        width: '100%',
                        height: '100%',
                        borderRadius: '0.75rem', // rounded-xl matches tailwind
                    },
                    video: {
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }
                }}
                components={{
                    onOff: true,
                    torch: true,
                    finder: false
                }}
                allowMultiple={false}
                scanDelay={500}
            />

            {/* Overlay guide */}
            <div className="absolute inset-0 border-2 border-white/20 rounded-xl pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-primary rounded-lg box-border">
                    {/* Corner markers could go here */}
                </div>
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/70 pointer-events-none">
                Point camera at a friend's code
            </div>
        </div>
    );
}
