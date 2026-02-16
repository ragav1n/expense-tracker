'use client'

import { DashboardView } from '@/components/dashboard-view'
import { Component as SignInCard } from '@/components/sign-in-card'

import { useUserPreferences } from '@/components/providers/user-preferences-provider'

export default function Page() {
  const { isAuthenticated, isLoading } = useUserPreferences()

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] w-full relative overflow-hidden flex items-center justify-center">
        <div className="relative z-10">
          <SignInCard isSignUp={false} />
        </div>
      </div>
    )
  }

  return <DashboardView />
}
