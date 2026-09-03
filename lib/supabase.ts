// import { createBrowserClient } from '@supabase/ssr';

// export const supabase = createBrowserClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );


'use client';

import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    throw new Error('getSupabaseClient() must only be called in the browser.');
  }

  if (!window.__ENV) {
    throw new Error('Runtime environment not found.');
  }

  if (!client) {
    client = createBrowserClient(
      window.__ENV.SUPABASE_URL,
      window.__ENV.SUPABASE_ANON_KEY
    );
  }

  return client;
}

