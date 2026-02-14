'use client';

import React, { useEffect, useState } from 'react';
import { useUserPreferences } from '@/components/providers/user-preferences-provider';
import { AlertBanner } from '@/components/ui/alert-banner';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface BudgetAlertManagerProps {
    totalSpent: number;
}

export function BudgetAlertManager({ totalSpent }: BudgetAlertManagerProps) {
    const { budgetAlertsEnabled, monthlyBudget, formatCurrency } = useUserPreferences();
    const [showAlert, setShowAlert] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!budgetAlertsEnabled || monthlyBudget <= 0) {
            setShowAlert(false);
            return;
        }

        const percentage = (totalSpent / monthlyBudget) * 100;

        // Show alert if over 80%
        if (percentage >= 80) {
            setShowAlert(true);
        } else {
            setShowAlert(false);
        }
    }, [totalSpent, monthlyBudget, budgetAlertsEnabled]);

    if (!showAlert) return null;

    const percentage = Math.min((totalSpent / monthlyBudget) * 100, 100);
    const isOverBudget = totalSpent > monthlyBudget;

    return (
        <AnimatePresence>
            {showAlert && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-24 left-4 right-4 z-50 md:left-1/2 md:-translate-x-1/2 md:max-w-md"
                >
                    <AlertBanner
                        variant={isOverBudget ? "destructive" : "warning"}
                        title={isOverBudget ? "Budget Exceeded" : "Approaching Budget Limit"}
                        description={
                            isOverBudget
                                ? `You've spent ${formatCurrency(totalSpent)}, which is ${formatCurrency(totalSpent - monthlyBudget)} over your budget.`
                                : `You've used ${percentage.toFixed(0)}% of your monthly budget.`
                        }
                        onDismiss={() => setShowAlert(false)}
                        primaryAction={{
                            label: "Adjust Budget",
                            onClick: () => {
                                setShowAlert(false);
                                router.push('/settings');
                            }
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
