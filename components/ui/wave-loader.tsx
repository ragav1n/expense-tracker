"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { HTMLMotionProps, motion } from "framer-motion"

import { cn } from "@/lib/utils"

const waveLoaderVariants = cva("flex gap-2 items-center justify-center", {
    variants: {
        messagePlacement: {
            bottom: "flex-col",
            right: "flex-row",
            left: "flex-row-reverse",
        },
    },
    defaultVariants: {
        messagePlacement: "bottom",
    },
})

export interface WaveLoaderProps extends VariantProps<typeof waveLoaderVariants> {
    /**
     * The number of bouncing dots to display.
     * @default 5
     */
    bars?: number
    /**
     * Optional message to display alongside the bouncing dots.
     */
    message?: string
    /**
     * Position of the message relative to the spinner.
     * @default bottom
     */
    messagePlacement?: "bottom" | "left" | "right"
}

export function WaveLoader({
    bars = 5,
    message,
    messagePlacement,
    className,
    ...props
}: HTMLMotionProps<"div"> & WaveLoaderProps) {
    return (
        <div
            className={cn(waveLoaderVariants({ messagePlacement }), className)}
            style={{
                display: 'flex',
                flexDirection: (messagePlacement || 'bottom') === 'bottom' ? 'column' : (messagePlacement === 'left' ? 'row-reverse' : 'row'),
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
            }}
        >
            <div className={cn("flex gap-1 items-center justify-center")}>
                {Array(bars)
                    .fill(undefined)
                    .map((_, index) => (
                        <motion.div
                            key={index}
                            className={cn("w-1.5 h-4 bg-primary rounded-full origin-bottom")}
                            animate={{ scaleY: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{
                                duration: 1,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: index * 0.1,
                                ease: "easeInOut"
                            }}
                            {...props}
                        />
                    ))}
            </div>
            {message && (
                <div
                    className="text-xs text-muted-foreground animate-pulse mt-4"
                    style={{ marginTop: '1rem' }}
                >
                    {message}
                </div>
            )}
        </div>
    )
}
