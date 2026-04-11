import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// We use the Service Role Key here because this is a server-to-server request,
// and it needs permission to bypass RLS to update the user's tier.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // You'll need to get this from Supabase API settings
);

export async function POST(request: Request) {
  try {
    const text = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    // Verify that this request ACTUALLY came from Paystack (Security)
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(text)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the verified event
    const event = JSON.parse(text);

    // Handle a Successful Payment
    if (event.event === 'charge.success') {
      const data = event.data;
      
      // Extract the user_id we passed in the metadata earlier!
      const userId = data.metadata?.custom_fields?.find(
        (f: any) => f.variable_name === 'user_id'
      )?.value;

      if (userId) {
        // 4. Upsert the user's tier to 'pro' in Supabase (creates row if missing)
        const { error } = await supabaseAdmin
          .from('profiles')
          .upsert({ 
            id: userId, 
            tier: 'pro', 
            updated_at: new Date().toISOString() 
          });

        if (error) {
          console.error('Error upgrading user in DB:', error);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
        
        console.log(`Successfully upgraded user ${userId} to PRO!`);
      }
    }

    // Paystack requires a 200 OK response to know we received the webhook
    return NextResponse.json({ message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}