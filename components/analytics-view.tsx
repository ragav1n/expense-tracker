'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, Pie, PieChart } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/pie-chart";
import { supabase } from '@/lib/supabase';
import { format, subMonths, startOfMonth, endOfMonth, isSameMonth, parseISO } from 'date-fns';
import { WaveLoader } from '@/components/ui/wave-loader';

// Constants for consistent coloring
const CATEGORY_COLORS: Record<string, string> = {
    food: '#8A2BE2',      // Electric Purple
    transport: '#FF6B6B', // Coral
    bills: '#4ECDC4',     // Teal
    shopping: '#F9C74F',  // Yellow
    healthcare: '#FF9F1C', // Orange
    entertainment: '#2EC4B6', // Light Blue
    others: '#C7F464',    // Lime
};

const chartConfig: ChartConfig = {
    food: { label: "Food", color: CATEGORY_COLORS.food },
    transport: { label: "Transport", color: CATEGORY_COLORS.transport },
    bills: { label: "Bills", color: CATEGORY_COLORS.bills },
    shopping: { label: "Shopping", color: CATEGORY_COLORS.shopping },
    healthcare: { label: "Healthcare", color: CATEGORY_COLORS.healthcare },
    entertainment: { label: "Entertainment", color: CATEGORY_COLORS.entertainment },
    others: { label: "Others", color: CATEGORY_COLORS.others },
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-xl">
                <p className="text-sm font-bold mb-2 text-foreground">{label}</p>
                <div className="space-y-1">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.stroke || entry.color || entry.fill }}
                            />
                            <span className="text-muted-foreground capitalize">{entry.name}:</span>
                            <span className="font-mono font-medium">${Number(entry.value).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export function AnalyticsView() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [categoryTrendData, setCategoryTrendData] = useState<any[]>([]);
    const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
    const [currentMonthTotal, setCurrentMonthTotal] = useState(0);
    const [lastMonthTotal, setLastMonthTotal] = useState(0);

    useEffect(() => {
        async function fetchData() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Fetch transactions for the last 6 months
                const sixMonthsAgo = subMonths(new Date(), 6);
                const { data: transactions } = await supabase
                    .from('transactions')
                    .select('*')
                    .gte('date', startOfMonth(sixMonthsAgo).toISOString())
                    .order('date', { ascending: true });

                if (transactions) {
                    processTransactions(transactions);
                }
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const processTransactions = (transactions: any[]) => {
        const now = new Date();
        const currentMonth = now;
        const lastMonth = subMonths(now, 1);

        // 1. Process Monthly Trends (Last 6 Months)
        const monthsMap: Record<string, any> = {};
        // Initialize last 6 months
        for (let i = 6; i >= 0; i--) {
            const d = subMonths(now, i);
            const monthKey = format(d, 'MMM');
            monthsMap[monthKey] = { month: monthKey };
            // Initialize all categories to 0
            Object.keys(CATEGORY_COLORS).forEach(cat => monthsMap[monthKey][cat] = 0);
        }

        transactions.forEach(tx => {
            const date = parseISO(tx.date);
            const monthKey = format(date, 'MMM');
            if (monthsMap[monthKey]) {
                const cat = tx.category.toLowerCase();
                if (!monthsMap[monthKey][cat]) monthsMap[monthKey][cat] = 0;
                monthsMap[monthKey][cat] += Number(tx.amount);
            }
        });
        setCategoryTrendData(Object.values(monthsMap));


        // 2. Process Current Month Breakdown
        const currentMonthTxs = transactions.filter(tx => isSameMonth(parseISO(tx.date), currentMonth));
        const lastMonthTxs = transactions.filter(tx => isSameMonth(parseISO(tx.date), lastMonth));

        const currentTotal = currentMonthTxs.reduce((sum, tx) => sum + Number(tx.amount), 0);
        const lastTotal = lastMonthTxs.reduce((sum, tx) => sum + Number(tx.amount), 0);
        setCurrentMonthTotal(currentTotal);
        setLastMonthTotal(lastTotal);

        const breakdownMap: Record<string, number> = {};
        currentMonthTxs.forEach(tx => {
            const cat = tx.category.toLowerCase();
            breakdownMap[cat] = (breakdownMap[cat] || 0) + Number(tx.amount);
        });

        const breakdownData = Object.entries(breakdownMap).map(([name, amount]) => {
            // Calculate percentage relative to total spent
            const percentage = currentTotal > 0 ? (amount / currentTotal) * 100 : 0;
            return {
                name: name.charAt(0).toUpperCase() + name.slice(1),
                amount,
                value: percentage,
                color: CATEGORY_COLORS[name] || CATEGORY_COLORS.others,
                fill: CATEGORY_COLORS[name] || CATEGORY_COLORS.others,
                stroke: CATEGORY_COLORS[name] || CATEGORY_COLORS.others,
            };
        }).sort((a, b) => b.amount - a.amount);

        setCategoryBreakdown(breakdownData);
    };

    const percentageChange = lastMonthTotal > 0
        ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
        : 0;


    if (loading) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center min-h-[50vh]">
                <WaveLoader bars={5} message="Loading analytics..." />
            </div>
        );
    }

    return (
        <div className="p-5 space-y-6 max-w-md mx-auto relative pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold">Analytics</h2>
                <button className="p-2 rounded-full hover:bg-secondary/30 transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                </button>
            </div>

            {/* Monthly Spending Trend */}
            <Card className="bg-card/50 backdrop-blur-md border-white/5">
                <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-sm">Category Trends (Last 6 Months)</h3>
                    </div>

                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={categoryTrendData}>
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                {Object.keys(CATEGORY_COLORS).map((cat) => (
                                    <Line
                                        key={cat}
                                        type="monotone"
                                        dataKey={cat}
                                        stroke={CATEGORY_COLORS[cat]}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
                            percentageChange >= 0 ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                        )}>
                            <span className="text-xs">
                                {percentageChange >= 0 ? '↑' : '↓'} {Math.abs(percentageChange).toFixed(1)}% vs last month
                            </span>
                        </div>
                        <div className="px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-medium border border-primary/20">
                            {format(new Date(), 'MMMM yyyy')}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Category Breakdown including Pie Chart */}
            <div className="space-y-4">
                <h3 className="font-semibold text-sm">Category Breakdown</h3>

                {/* Pie Chart Integration */}
                <div className="h-[250px] w-full">
                    {categoryBreakdown.length > 0 ? (
                        <ChartContainer
                            config={chartConfig}
                            className="mx-auto aspect-square max-h-[250px]"
                        >
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie
                                    data={categoryBreakdown}
                                    dataKey="amount"
                                    nameKey="name"
                                    innerRadius={60}
                                    strokeWidth={0}
                                    paddingAngle={5}
                                    cornerRadius={5}
                                >
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            No data for this month
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {categoryBreakdown.map((cat) => (
                        <div key={cat.name} className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.fill }} />
                                    {cat.name}
                                </span>
                                <span className="font-semibold">${cat.amount.toFixed(2)}</span>
                            </div>

                            {/* Simple Progress Bar */}
                            <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${cat.value}%`, backgroundColor: cat.fill }}
                                />
                            </div>

                            <div className="flex justify-end text-[10px] text-muted-foreground">
                                <span>{cat.value.toFixed(1)}% of total</span>
                            </div>
                        </div>
                    ))}
                    {categoryBreakdown.length === 0 && (
                        <div className="text-center text-xs text-muted-foreground">
                            No transactions recorded this month.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
