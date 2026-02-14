'use client';

import React, { useState } from 'react';
import { ChevronLeft, Search, SlidersHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Mock Data
const allTransactions = [
    { id: 1, name: 'Starbucks Coffee', category: 'Food', date: '2025-01-30', amount: -12.50, icon: '☕', method: 'Credit Card' },
    { id: 2, name: 'Coffee Bean & Tea', category: 'Food', date: '2025-01-29', amount: -8.75, icon: '☕', method: 'Cash' },
    { id: 3, name: 'Local Coffee Shop', category: 'Food', date: '2026-01-28', amount: -6.50, icon: '☕', method: 'Digital Wallet' },
    { id: 4, name: "Dunkin' Donuts", category: 'Food', date: '2025-01-27', amount: -4.99, icon: '☕', method: 'Credit Card' },
    { id: 5, name: 'Café Mocha', category: 'Food', date: '2025-01-25', amount: -11.25, icon: '☕', method: 'Credit Card' },
];

const filters = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month', active: true },
    { id: 'food', label: 'Food', active: true },
    { id: 'over20', label: 'Over $20' },
];

export function SearchView() {
    const router = useRouter();
    const [activeFilters, setActiveFilters] = useState(['month', 'food']);

    const toggleFilter = (id: string) => {
        setActiveFilters(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    return (
        <div className="p-5 space-y-6 max-w-md mx-auto relative pb-24 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold">Search & Filter</h2>
                <button className="px-3 py-1 text-xs text-primary font-medium hover:text-primary/80">
                    Next
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search transactions"
                    className="pl-9 bg-secondary/10 border-white/10 h-10 rounded-xl focus-visible:ring-primary/50"
                />
            </div>

            {/* Quick Filters */}
            <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground">Quick Filters</h3>
                <div className="flex flex-wrap gap-2">
                    {filters.map((filter) => {
                        const isActive = activeFilters.includes(filter.id);
                        return (
                            <button
                                key={filter.id}
                                onClick={() => toggleFilter(filter.id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                    isActive
                                        ? "bg-primary text-white shadow-[0_0_10px_rgba(138,43,226,0.4)]"
                                        : "bg-secondary/20 text-muted-foreground hover:bg-secondary/30"
                                )}
                            >
                                {filter.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Results */}
            <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">8 Results</h3>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-primary/20 text-[10px] text-primary border border-primary/20">Filtered</span>
                        <button className="p-1.5 rounded-full bg-secondary/20">
                            <SlidersHorizontal className="w-3 h-3 text-muted-foreground" />
                        </button>
                    </div>
                </div>

                <div className="space-y-3 overflow-y-auto pr-1 -mr-1">
                    {allTransactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl bg-card/20 border border-white/5 hover:bg-card/40 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#3E2723] flex items-center justify-center text-lg border border-white/5">
                                    {tx.icon}
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{tx.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-[10px] text-primary border border-primary/10">{tx.category}</span>
                                        <span>• {tx.method}</span>
                                        <span>• {tx.date}</span>
                                    </div>
                                </div>
                            </div>
                            <span className="font-bold text-sm">{tx.amount < 0 ? `-$${Math.abs(tx.amount).toFixed(2)}` : `+$${tx.amount.toFixed(2)}`}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Total Footer */}
            <div className="mt-auto pt-4 border-t border-white/10">
                <div className="flex justify-between items-center bg-card/40 p-4 rounded-2xl border border-white/5">
                    <div>
                        <p className="text-xs text-muted-foreground">Total Coffee Expenses</p>
                        <p className="text-[10px] text-muted-foreground/60">8 transactions this month</p>
                    </div>
                    <span className="text-xl font-bold">-$43.99</span>
                </div>
            </div>
        </div>
    );
}
