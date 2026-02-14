'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, SlidersHorizontal, Utensils, Car, Zap, ShoppingBag, HeartPulse, Clapperboard, Wallet, Banknote, CreditCard, CircleDollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { format, parseISO, isSameWeek, isSameMonth } from 'date-fns';
import { WaveLoader } from '@/components/ui/wave-loader';
import { useUserPreferences } from '@/components/providers/user-preferences-provider';

type Transaction = {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    payment_method: string;
    created_at: string;
    currency?: string;
};

const filters = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'food', label: 'Food' },
    { id: 'transport', label: 'Transport' },
    { id: 'bills', label: 'Bills' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'entertainment', label: 'Entertainment' },
    { id: 'over20', label: 'Over $20' },
];

export function SearchView() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const { formatCurrency, convertAmount } = useUserPreferences();

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchQuery, activeFilters, transactions]);

    const fetchTransactions = async () => {
        try {
            const { data } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false });

            if (data) {
                setTransactions(data);
                setFilteredTransactions(data);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = transactions;

        // 1. Text Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(tx =>
                tx.description.toLowerCase().includes(query) ||
                tx.category.toLowerCase().includes(query)
            );
        }

        // 2. Filters
        if (activeFilters.length > 0) {
            const now = new Date();

            // Time filters
            if (activeFilters.includes('week')) {
                result = result.filter(tx => isSameWeek(parseISO(tx.date), now));
            }
            if (activeFilters.includes('month')) {
                result = result.filter(tx => isSameMonth(parseISO(tx.date), now));
            }

            // Amount filter
            if (activeFilters.includes('over20')) {
                result = result.filter(tx => Number(tx.amount) > 20);
            }

            // Category filters (dynamic check)
            const categoryFilters = activeFilters.filter(f => !['week', 'month', 'over20'].includes(f));
            if (categoryFilters.length > 0) {
                result = result.filter(tx => categoryFilters.includes(tx.category.toLowerCase()));
            }
        }

        setFilteredTransactions(result);
    };

    const toggleFilter = (id: string) => {
        setActiveFilters(prev => {
            // Exclusive time filters logic (optional, but good UX)
            if (id === 'week' && prev.includes('month')) return [...prev.filter(f => f !== 'month'), id];
            if (id === 'month' && prev.includes('week')) return [...prev.filter(f => f !== 'week'), id];

            return prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
        });
    };

    const getIconForCategory = (category: string) => {
        switch (category.toLowerCase()) {
            case 'food': return <Utensils className="w-5 h-5 text-white" />;
            case 'transport': return <Car className="w-5 h-5 text-white" />;
            case 'bills': return <Zap className="w-5 h-5 text-white" />;
            case 'shopping': return <ShoppingBag className="w-5 h-5 text-white" />;
            case 'healthcare': return <HeartPulse className="w-5 h-5 text-white" />;
            case 'entertainment': return <Clapperboard className="w-5 h-5 text-white" />;
            default: return <CircleDollarSign className="w-5 h-5 text-white" />;
        }
    };

    const totalFilteredAmount = filteredTransactions.reduce((sum, tx) => sum + convertAmount(Number(tx.amount), tx.currency || 'USD'), 0);

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
                <div className="w-9" />
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search transactions"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-secondary/10 border-white/10 h-10 rounded-xl focus-visible:ring-primary/50"
                />
            </div>

            {/* Quick Filters */}
            <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground">Filters</h3>
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
            <div className="flex-1 space-y-2 min-h-0 flex flex-col">
                <div className="flex items-center justify-between flex-shrink-0">
                    <h3 className="font-semibold text-sm">{filteredTransactions.length} Results</h3>
                    {activeFilters.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-[10px] text-primary border border-primary/20">Filtered</span>
                        </div>
                    )}
                </div>

                <div className="space-y-3 overflow-y-auto pr-1 -mr-1 flex-1">
                    {loading ? (
                        <div className="h-full w-full flex flex-col items-center justify-center min-h-[200px]">
                            <WaveLoader bars={5} message="Loading..." />
                        </div>
                    ) : filteredTransactions.length > 0 ? (
                        filteredTransactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl bg-card/20 border border-white/5 hover:bg-card/40 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center border border-white/5">
                                        {getIconForCategory(tx.category)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{tx.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-[10px] text-primary border border-primary/10 capitalize">{tx.category}</span>
                                            <span>• {tx.payment_method}</span>
                                            <span>• {format(parseISO(tx.date), 'MMM d')}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="font-bold text-sm">-{formatCurrency(Number(tx.amount), tx.currency)}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No transactions found.
                        </div>
                    )}
                </div>
            </div>

            {/* Total Footer */}
            <div className="pt-4 border-t border-white/10 flex-shrink-0">
                <div className="flex justify-between items-center bg-card/40 p-4 rounded-2xl border border-white/5">
                    <div>
                        <p className="text-xs text-muted-foreground">Total Filtered</p>
                        <p className="text-[10px] text-muted-foreground/60">{filteredTransactions.length} transactions</p>
                    </div>
                    <span className="text-xl font-bold">{formatCurrency(totalFilteredAmount)}</span>
                </div>
            </div>
        </div>
    );
}
