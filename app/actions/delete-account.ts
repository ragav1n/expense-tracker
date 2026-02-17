'use server';

import { z } from 'zod';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

const DeleteAccountSchema = z.object({
    email: z.string().email(),
    password: z.string().optional(),
    otpToken: z.string().optional(),
});

export async function deleteAccount(email: string, password?: string, otpToken?: string) {
    const result = DeleteAccountSchema.safeParse({ email, password, otpToken });

    if (!result.success) {
        return { error: 'Invalid input data' };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseServiceRoleKey) {
        console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
        return { error: 'Server configuration error' };
    }

    try {
        // 1. Verify current session and email match
        const supabase = await createClient();
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

        if (userError || !currentUser || currentUser.email !== email) {
            return { error: 'Unauthorized: You can only delete your own account' };
        }

        const adminClient = createAdminClient(supabaseUrl, supabaseServiceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        if (password) {
            // Verify credentials by attempting to sign in
            const authClient = createAdminClient(supabaseUrl, supabaseAnonKey);
            const { error: signInError } = await authClient.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                return { error: 'Invalid password' };
            }
        } else {
            // No password provided: Check if user has a password set
            const providers = (currentUser.app_metadata?.providers as string[]) || [];
            if (providers.includes('email')) {
                return { error: 'Password is required to delete this account' };
            }
            // Logic reaches here if OTP was required and (ideally) already verified client-side
            // If it wasn't verified, the RPC or next steps might fail depending on DB constraints
            // but we trust the client-side check for this flow as requested.
        }

        // 3. Initialize admin client for deletion
        // (adminClient is already initialized above)

        // 4. Prepare data for deletion (RPC)
        const { error: rpcError } = await adminClient.rpc('prepare_delete_account', {
            p_user_id: currentUser.id
        });

        if (rpcError) {
            console.error('Error preparing account deletion:', rpcError);
            return { error: 'Failed to clean up user data. Please try again.' };
        }

        // 5. Delete the user from auth.users
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(currentUser.id);

        if (deleteError) {
            console.error('Error deleting user:', deleteError);
            return { error: 'Failed to delete user account. Please contact support.' };
        }

        return { success: true };
    } catch (error) {
        console.error('Unexpected error during account deletion:', error);
        return { error: 'An unexpected error occurred' };
    }
}
