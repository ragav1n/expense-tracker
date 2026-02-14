import fs from 'fs'
import path from 'path'

// Load .env file manually
try {
    const envPath = path.resolve(__dirname, '../.env')
    const envFile = fs.readFileSync(envPath, 'utf8')
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value) {
            process.env[key.trim()] = value.trim()
        }
    })
    console.log('Loaded env keys:', Object.keys(process.env).filter(k => k.startsWith('NEXT_')))
    console.log('URL defined:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
} catch (e) {
    console.log('Could not load .env file:', e)
}

// import { supabase } from '../lib/supabase' // Removed static import

async function checkConnection() {
    const { supabase } = await import('../lib/supabase') // Dynamic import

    console.log('Checking Supabase connection...')
    try {
        const { data, error } = await supabase.from('test_connection').select('*').limit(1)
        // It might error if table doesn't exist, but that means connection worked (404/400 vs 500/network error)
        // Better: just check auth health or something simple.
        // Actually, simple getSession is enough to check if client initializes.
        const { data: authData, error: authError } = await supabase.auth.getSession()

        if (authError) {
            console.error('Auth check failed:', authError.message)
        } else {
            console.log('Supabase Auth connection successful. Session:', authData.session ? 'Active' : 'None')
        }

    } catch (error) {
        console.error('Unexpected error:', error)
    }
}

checkConnection()
