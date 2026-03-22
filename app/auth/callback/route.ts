// import { createServerClient } from '@supabase/ssr'
// import { cookies } from 'next/headers'
// import { NextResponse } from 'next/server'

// export async function GET(request: Request) {
//   const requestUrl = new URL(request.url)
//   const code = requestUrl.searchParams.get('code')
//   const next = requestUrl.searchParams.get('next') ?? '/builder' // Send them back to the builder by default

//   if (code) {
//     // Next.js 15: await the cookies object
//     const cookieStore = await cookies()
    
//     // We use @supabase/ssr here to securely set HTTP-only cookies on the server
//     const supabase = createServerClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//       {
//         cookies: {
//           getAll() {
//             return cookieStore.getAll()
//           },
//           setAll(cookiesToSet) {
//             try {
//               cookiesToSet.forEach(({ name, value, options }) => {
//                 cookieStore.set(name, value, options)
//               })
//             } catch {
//               // This error is safely ignored in Route Handlers
//             }
//           },
//         },
//       }
//     )

//     // Exchange the secure code for a logged-in session
//     await supabase.auth.exchangeCodeForSession(code)
//   }

//   // Redirect the user to the builder page so they can continue working
//   return NextResponse.redirect(new URL(next, request.url))
// }



import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  // UPDATED: Now redirects to the dashboard after successful login!
  const next = requestUrl.searchParams.get('next') ?? '/dashboard' 

  if (code) {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {}
          },
        },
      }
    )
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL(next, request.url))
}