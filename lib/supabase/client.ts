import {createBrowserClient} from '@supabase/ssr'
import type {SupabaseClient} from '@supabase/supabase-js'
let browserClient:SupabaseClient|undefined
export function createClient(){browserClient??=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{cookieOptions:{secure:process.env.NODE_ENV==='production'}});return browserClient}
