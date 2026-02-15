'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FallingPattern } from '@/components/ui/falling-pattern';

export default function AuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [message, setMessage] = useState('Verifying your account...');

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const error = searchParams.get('error');
            const error_description = searchParams.get('error_description');

            if (error) {
                setMessage(`Error: ${error_description || error}`);
                setTimeout(() => router.push('/signin'), 3000);
                return;
            }

            if (code) {
                try {
                    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
                    if (sessionError) throw sessionError;

                    setMessage('Successfully verified! Redirecting...');
                    setTimeout(() => router.push('/'), 1000);
                } catch (err: any) {
                    setMessage(`Verification failed: ${err.message}`);
                    setTimeout(() => router.push('/signin'), 3000);
                }
            } else {
                // Determine if we have a session (implicit flow or already logged in)
                const { data } = await supabase.auth.getSession();
                if (data.session) {
                    router.push('/');
                } else {
                    // No code, no session -> redirect to signin
                    router.push('/signin');
                }
            }
        };

        handleCallback();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen w-screen bg-background relative overflow-hidden flex items-center justify-center">
            <FallingPattern color="#6237A0" className="absolute inset-0 z-0" />
            <div className="relative z-10 bg-card/60 backdrop-blur-xl rounded-2xl p-8 border border-primary/20 shadow-2xl text-center">
                <h1 className="text-xl font-bold mb-2">Authentication</h1>
                <p className="text-foreground/80">{message}</p>
            </div>
        </div>
    );
}
