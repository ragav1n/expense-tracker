'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCodeStyling, {
    DrawType,
    TypeNumber,
    Mode,
    ErrorCorrectionLevel,
    DotType,
    CornerSquareType,
    CornerDotType
} from 'qr-code-styling';
import { cn } from '@/lib/utils';

export interface QrCodeProps {
    value: string;
    className?: string;
    width?: number;
    height?: number;
}

export const NoviraQrCode = ({ value, className, width = 200, height = 200 }: QrCodeProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [qrCode] = useState<QRCodeStyling>(new QRCodeStyling({
        width: width,
        height: height,
        type: 'svg' as DrawType,
        data: value,
        image: '/Novira.png',
        margin: 5,
        qrOptions: {
            typeNumber: 0 as TypeNumber,
            mode: 'Byte' as Mode,
            errorCorrectionLevel: 'H' as ErrorCorrectionLevel
        },
        imageOptions: {
            hideBackgroundDots: true,
            imageSize: 0.3,
            margin: 10,
            crossOrigin: 'anonymous',
        },
        dotsOptions: {
            type: 'rounded' as DotType,
            gradient: {
                type: 'linear',
                rotation: 45,
                colorStops: [
                    { offset: 0, color: '#8b5cf6' }, // Violet-500
                    { offset: 1, color: '#ec4899' }  // Pink-500
                ]
            }
        },
        backgroundOptions: {
            color: '#ffffff',
        },
        cornersSquareOptions: {
            type: 'extra-rounded' as CornerSquareType,
            color: '#8b5cf6' // Maintain theme consistency
        },
        cornersDotOptions: {
            type: 'dot' as CornerDotType,
            color: '#ec4899'
        }
    }));

    useEffect(() => {
        if (ref.current) {
            qrCode.append(ref.current);
        }
    }, [qrCode, ref]);

    useEffect(() => {
        qrCode.update({
            data: value
        });
    }, [value, qrCode]);

    return (
        <div
            ref={ref}
            className={cn(
                'flex items-center justify-center bg-white rounded-3xl overflow-hidden shadow-xl border-4 border-white p-2',
                className
            )}
        />
    );
};

NoviraQrCode.displayName = 'NoviraQrCode';
