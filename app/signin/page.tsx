'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Component as SignInCard } from '@/components/sign-in-card'

function SignInContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const code = searchParams.get('code')
        const next = searchParams.get('next')
        if (code) {
            // Redirect to the auth callback route to exchange the code for a session
            const callbackUrl = new URL('/auth/callback', window.location.origin)
            callbackUrl.searchParams.set('code', code)
            if (next) callbackUrl.searchParams.set('next', next)
            router.push(callbackUrl.pathname + callbackUrl.search)
        }
    }, [searchParams, router])

    return <SignInCard isSignUp={false} />
}

export default function SignInPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <SignInContent />
        </Suspense>
    )
}
