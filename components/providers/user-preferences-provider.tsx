'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type Currency = 'USD' | 'EUR' | 'INR';

interface UserPreferencesContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    formatCurrency: (amount: number, currencyOverride?: string) => string;
    refreshPreferences: () => Promise<void>;
    convertAmount: (amount: number, fromCurrency: string) => number;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrencyState] = useState<Currency>('USD');
    const [loading, setLoading] = useState(true);
    const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

    // Fetch Exchange Rates when currency changes
    useEffect(() => {
        const fetchRates = async () => {
            try {
                // api.frankfurter.dev requires the base currency to be different from the target or it returns empty/error sometimes for same base
                // simpler: just fetch latest with base = currency
                const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=${currency}`);
                if (!response.ok) throw new Error('Failed to fetch rates');
                const data = await response.json();
                setExchangeRates(data.rates);
            } catch (error) {
                console.error('Error fetching exchange rates:', error);
            }
        };

        fetchRates();
    }, [currency]);

    const refreshPreferences = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('currency')
                .eq('id', user.id)
                .single();

            if (data?.currency) {
                setCurrencyState(data.currency as Currency);
            }
        } catch (error) {
            console.error('Error fetching preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshPreferences();

        // Subscribe to realtime changes for instant updates across tabs/components
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                },
                (payload) => {
                    if (payload.new && (payload.new as any).currency) {
                        setCurrencyState((payload.new as any).currency as Currency);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const setCurrency = async (newCurrency: Currency) => {
        // Optimistic update
        setCurrencyState(newCurrency);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('profiles')
                .update({ currency: newCurrency })
                .eq('id', user.id);

            if (error) throw error;

        } catch (error) {
            console.error('Error updating currency:', error);
            toast.error('Failed to update currency preference');
            // Revert on error
            refreshPreferences();
        }
    };

    const formatCurrency = (amount: number, currencyOverride?: string) => {
        const targetCurrency = currencyOverride || currency;

        // Custom formatting for Euro to ensure prefix
        if (targetCurrency === 'EUR') {
            return new Intl.NumberFormat('en-IE', {
                style: 'currency',
                currency: 'EUR',
            }).format(amount);
        }

        // Custom formatting for INR
        if (targetCurrency === 'INR') {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
            }).format(amount);
        }

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: targetCurrency,
        }).format(amount);
    };

    const convertAmount = (amount: number, fromCurrency: string): number => {
        if (!fromCurrency || fromCurrency === currency) return amount;

        const rate = exchangeRates[fromCurrency];
        if (rate) {
            return amount / rate;
        }

        return amount;
    };

    return (
        <UserPreferencesContext.Provider value={{ currency, setCurrency, formatCurrency, refreshPreferences, convertAmount }}>
            {children}
        </UserPreferencesContext.Provider>
    );
}

export function useUserPreferences() {
    const context = useContext(UserPreferencesContext);
    if (context === undefined) {
        throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
    }
    return context;
}
