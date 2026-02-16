'use client'

import { useEffect, useState } from 'react'
import { DashboardView } from '@/components/dashboard-view'
import { Component as SignInCard } from '@/components/sign-in-card'
import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'

export default function Page() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!session) {
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
