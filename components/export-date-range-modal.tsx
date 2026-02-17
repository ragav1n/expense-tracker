'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Download, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming this exists
import { useIsMobile } from '@/components/ui/use-mobile';

interface ExportDateRangeModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onExport: (range: DateRange | null) => void;
    title?: string;
    description?: string;
    loading?: boolean;
}

export function ExportDateRangeModal({
    isOpen,
    onOpenChange,
    onExport,
    title = "Export Data",
    description = "Select a date range to export your transaction history.",
    loading = false
}: ExportDateRangeModalProps) {
    const isMobile = useIsMobile();
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

    const handlePresetSelect = (preset: string) => {
        const now = new Date();
        let range: DateRange | undefined;

        switch (preset) {
            case 'current_month':
                range = { from: startOfMonth(now), to: endOfMonth(now) };
                break;
            case 'last_month':
                const lastMonth = subMonths(now, 1);
                range = { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
                break;
            case 'last_3_months':
                range = { from: subMonths(now, 3), to: now };
                break;
            case 'last_6_months':
                range = { from: subMonths(now, 6), to: now };
                break;
            case 'this_year':
                range = { from: startOfYear(now), to: endOfYear(now) };
                break;
            case 'last_year':
                const lastYear = subYears(now, 1);
                range = { from: startOfYear(lastYear), to: endOfYear(lastYear) };
                break;
            case 'all_time':
                range = undefined; // Special case for all time
                break;
        }

        setDateRange(range);
        setSelectedPreset(preset);
    };

    const handleCustomDateChange = (range: DateRange | undefined) => {
        setDateRange(range);
        setSelectedPreset('custom');
    };

    const handleExportClick = () => {
        // If 'all_time' is selected (range is undefined but preset is 'all_time'), pass null
        // If range is undefined and no preset, defaulting to null (all time) or alerting?
        // Let's assume if nothing is selected, we export nothing or default? 
        // User asked for "all time". If range is undefined, it might mean "all time" or "nothing selected".
        // Let's use null for "All Time".

        if (selectedPreset === 'all_time') {
            onExport(null);
        } else if (dateRange?.from) {
            onExport(dateRange);
        } else {
            // Default to all time if nothing selected?? Or force selection?
            // Let's force selection or default to current month?
            // Better to default to All Time if nothing selected? Or disable button?
            // "Select Current Month... All Time".
            // Let's disable export if no range and not all_time.
            if (dateRange) {
                onExport(dateRange);
            } else {
                // Maybe just default to null (All Time) if user didn't pick anything?
                // Or better, set 'all_time' as default on open?
                onExport(null);
            }
        }
    };

    // Auto-select 'current_month' on open if nothing selected?
    // Or just leave empty.

    const presets = [
        { id: 'current_month', label: 'Current Month' },
        { id: 'last_month', label: 'Last Month' },
        { id: 'last_3_months', label: 'Last 3 Months' },
        { id: 'last_6_months', label: 'Last 6 Months' },
        { id: 'this_year', label: 'This Year' },
        { id: 'all_time', label: 'All Time' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-background border-white/10">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-2">
                        {presets.map((preset) => (
                            <Button
                                key={preset.id}
                                variant="outline"
                                onClick={() => handlePresetSelect(preset.id)}
                                className={cn(
                                    "justify-start font-normal",
                                    selectedPreset === preset.id && "bg-primary/20 border-primary text-primary hover:bg-primary/25"
                                )}
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                {preset.label}
                            </Button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Custom Range</label>
                        <DateRangePicker
                            date={dateRange}
                            setDate={handleCustomDateChange}
                            align={isMobile ? "center" : "start"}
                            className="w-full"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleExportClick} disabled={loading || (!dateRange && selectedPreset !== 'all_time')} className="min-w-[100px]">
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                <span>Exporting...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </div>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
