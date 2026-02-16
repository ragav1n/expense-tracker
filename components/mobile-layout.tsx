'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Plus, BarChart2, Search, Settings, Users } from 'lucide-react';
// Use the new components from ui folder
import { FallingPattern } from '@/components/ui/falling-pattern';
import { ExpandableTabs } from '@/components/ui/expandable-tabs';
import { Toaster } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useUserPreferences } from '@/components/providers/user-preferences-provider';

export function MobileLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();


    const tabs = [
        { title: "Home", icon: Home },
        { title: "Add", icon: Plus },
        { title: "Analytics", icon: BarChart2 },
        { title: "Groups", icon: Users },
        { type: "separator" } as const,
        { title: "Search", icon: Search },
        { title: "Settings", icon: Settings },
    ];

    const routes = ['/', '/add', '/analytics', '/groups', null, '/search', '/settings'];

    const handleTabChange = (index: number | null) => {
        if (index !== null) {
            const route = routes[index];
            if (route) {
                router.push(route);
            }
        }
    };

    const pathname = usePathname();
    const isAuthPage = ['/signin', '/signup', '/forgot-password', '/update-password'].includes(pathname);
    const { isAuthenticated, isLoading } = useUserPreferences();

    const showNav = !isAuthPage && isAuthenticated;

    if (isLoading) {
        return null;
    }

    return (
        <div className="min-h-screen w-full bg-background text-foreground relative overflow-hidden font-sans select-none flex flex-col">

            {/* Main Content Area */}
            <main className={cn(
                "flex-1 w-full overflow-y-auto no-scrollbar relative z-10 flex flex-col",
                showNav ? "pb-24" : "pb-0"
            )}>
                {children}
            </main>

            {/* Bottom Navigation */}
            {showNav && (
                <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4">
                    <ExpandableTabs
                        tabs={tabs}
                        className="bg-background/80 backdrop-blur-xl border-white/10 shadow-2xl shadow-primary/20"
                        activeColor="text-primary bg-primary/10"
                        onChange={handleTabChange}
                    />
                </div>
            )}

            <Toaster />
        </div>
    );
}
