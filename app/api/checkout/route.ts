import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // 1. Next.js 15 requirement: AWAIT the cookies
    const cookieStore = await cookies();
    
    // 2. Initialize Supabase using the new getAll / setAll signature
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // This error is safely ignored in API Routes
            }
          },
        },
      }
    );

    // 3. Get the currently logged-in user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // 4. Prepare the Paystack payload
    // Paystack amounts are in KOBO (or the lowest currency unit). So ₦2,500 is 250,000 kobo.
    const amountInKobo = 5000 * 100; 
    
    // We pass the user's ID in the metadata. THIS IS CRUCIAL. 
    // When Paystack sends the success webhook later, we need this ID to know *who* to upgrade.
    const payload = {
      email: user.email,
      amount: amountInKobo,
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=success`,
      metadata: {
        custom_fields: [
          {
            display_name: "User ID",
            variable_name: "user_id",
            value: user.id
          }
        ]
      }
    };

    // 5. Make the secure request to Paystack
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      console.error('Paystack Error:', paystackData);
      return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 });
    }

    // 6. Send the secure Paystack checkout URL back to the frontend
    return NextResponse.json({ authorization_url: paystackData.data.authorization_url });

  } catch (error) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}