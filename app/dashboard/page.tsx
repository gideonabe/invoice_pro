import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js'; // <-- NEW: Imported for Admin client
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Lock } from 'lucide-react';

const formatCurrency = (amount: number) => {
  return '₦' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default async function DashboardPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const reference = searchParams?.reference as string;

  const cookieStore = await cookies();

  // 1. REGULAR CLIENT: Used for safely reading data as the logged-in user
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => { cookieStore.set(name, value, options); }); } catch { }
        },
      },
    }
  );

  // 2. ADMIN CLIENT: "God Mode" - Used strictly for writing secure data (like billing tiers)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // <-- Uses the secret key to bypass RLS
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let paymentSuccessfullyVerified = false;

  // --- PAYSTACK VERIFICATION & PRO UPGRADE ---
  if (reference) {
    try {
      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
        cache: 'no-store'
      });
      
      const verifyData = await verifyRes.json();

      if (verifyData.data?.status === 'success') {
        // USE ADMIN CLIENT: Force the database to upgrade the user to PRO
        const { error: upsertError } = await supabaseAdmin
          .from('profiles')
          .upsert({ id: user.id, tier: 'pro' });
          
        if (upsertError) {
          console.error("CRITICAL: Failed to update user to Pro in database:", upsertError);
        } else {
          paymentSuccessfullyVerified = true;
        }
      }
    } catch (error) {
      console.error("Payment verification failed:", error);
    }
  }

  if (paymentSuccessfullyVerified) {
    redirect('/dashboard');
  }

  // --- PROFILE CHECK & FREE TIER CREATION ---
  // Read the profile using the regular client
  let { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single();

  // If they don't exist yet, force-create a free profile using the ADMIN client
  if (!profile) {
    const { error: createError } = await supabaseAdmin
      .from('profiles')
      .upsert({ id: user.id, tier: 'free' });
      
    if (createError) {
      console.error("CRITICAL: Failed to create free profile:", createError);
    } else {
      profile = { tier: 'free' };
    }
  }

  const isPro = profile?.tier === 'pro';

  // Fetch invoices using the regular user client (RLS protects this perfectly)
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Calculations
  const totalInvoices = invoices?.length || 0;
  const totalRevenue = invoices?.reduce((acc, inv) => acc + Number(inv.amount_paid), 0) || 0;
  const outstandingBalance = invoices?.reduce((acc, inv) => {
    const balance = Number(inv.subtotal) - Number(inv.amount_paid);
    return acc + (balance > 0 ? balance : 0);
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-[#F4F4F2] text-[#0F0F0F] font-sans selection:bg-black selection:text-white">
      
      <nav className="border-b border-black/10 bg-[#F4F4F2]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-8 h-8 bg-[#0F0F0F] text-[#F4F4F2] rounded-full flex items-center justify-center font-bold hover:scale-105 transition-transform">
              ✽
            </Link>
            <span className="font-bold text-xl tracking-tighter">Workspace</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs font-mono text-black/50 hidden md:block uppercase tracking-widest">{user.email}</span>
            {isPro && (
              <span className="bg-[#A855F7]/10 text-[#A855F7] border border-[#A855F7]/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                Pro
              </span>
            )}
            <Link href="/builder" className="bg-[#0F0F0F] text-[#F4F4F2] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-black/80 transition shadow-sm">
              New Invoice &rarr;
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        
        <div className="mb-12 flex justify-between items-end border-b border-black/10 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tighter mb-2">Overview</h1>
            <p className="text-black/50 text-sm font-medium">Financial telemetry and outstanding ledgers.</p>
          </div>
        </div>

        {/* METRICS SECTION: THE FREEMIUM TEASER */}
        <div className="relative mb-16">
          
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500 ${!isPro ? 'blur-[8px] opacity-40 pointer-events-none select-none' : ''}`}>
            <div className="bg-white border border-black/10 rounded-2xl p-8 shadow-sm">
              <div className="text-xs text-black/40 font-bold mb-4 uppercase tracking-widest">Total Revenue</div>
              <div className="text-4xl font-medium tracking-tighter">{formatCurrency(totalRevenue)}</div>
            </div>
            <div className="bg-white border border-black/10 rounded-2xl p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-500/5 to-transparent pointer-events-none"></div>
              <div className="text-xs text-black/40 font-bold mb-4 uppercase tracking-widest relative z-10">Outstanding</div>
              <div className="text-4xl font-medium tracking-tighter text-red-600 relative z-10">{formatCurrency(outstandingBalance)}</div>
            </div>
            <div className="bg-white border border-black/10 rounded-2xl p-8 shadow-sm">
              <div className="text-xs text-black/40 font-bold mb-4 uppercase tracking-widest">Documents Sent</div>
              <div className="text-4xl font-medium tracking-tighter">{totalInvoices}</div>
            </div>
          </div>

          {!isPro && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
              <div className="bg-white border border-black/10 p-8 rounded-3xl shadow-2xl text-center max-w-sm transform scale-100 hover:scale-[1.02] transition-transform duration-300">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl shadow-lg">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-medium tracking-tighter mb-2">Analytics Locked</h3>
                <p className="text-black/50 text-sm mb-8 leading-relaxed">
                  Track your total revenue and monitor outstanding client balances with Premium.
                </p>
                <Link href="/#pricing" className="bg-[#0F0F0F] text-[#F4F4F2] px-6 py-4 rounded-full text-sm font-bold tracking-wide hover:bg-black/80 transition block w-full shadow-lg">
                  Upgrade to Premium &rarr;
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* INVOICES LEDGER */}
        <div>
          <h2 className="text-2xl font-medium tracking-tighter mb-8 flex items-center gap-3">
            Ledger 
            <span className="bg-black/5 text-black/50 px-2 py-0.5 rounded text-xs font-mono">{totalInvoices}</span>
          </h2>
          
          {!invoices || invoices.length === 0 ? (
            <div className="border border-black/10 rounded-2xl p-16 text-center bg-white shadow-sm">
              <div className="w-16 h-16 bg-[#F4F4F2] rounded-full flex items-center justify-center mx-auto mb-6 text-2xl border border-black/5">📄</div>
              <h3 className="text-xl font-medium tracking-tighter mb-2">No documents filed</h3>
              <p className="text-black/50 mb-8 max-w-sm mx-auto text-sm">Your ledger is currently empty. Generate your first document to populate the dashboard.</p>
              <Link href="/builder" className="inline-flex bg-[#0F0F0F] text-[#F4F4F2] px-6 py-3 rounded-full text-sm font-medium hover:bg-black/80 transition">
                Create First Invoice &rarr;
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/10 bg-[#F4F4F2] text-black/40 text-xs font-bold uppercase tracking-widest">
                      <th className="p-5 pl-8">Ref #</th>
                      <th className="p-5">Entity</th>
                      <th className="p-5">Issue Date</th>
                      <th className="p-5">Status</th>
                      <th className="p-5 text-right pr-8">Total</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-black/5">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-[#F4F4F2]/50 transition cursor-pointer group">
                        <td className="p-5 pl-8 font-mono text-black/60">{invoice.invoice_number}</td>
                        <td className="p-5 font-medium">{invoice.customer_name}</td>
                        <td className="p-5 text-black/50 font-mono text-xs">{new Date(invoice.issue_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="p-5">
                          <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                            invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                            invoice.status === 'Part-paid' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="p-5 text-right pr-8 flex items-center justify-end gap-6">
                          <span className="font-medium tracking-tight group-hover:text-purple-600 transition">
                            {formatCurrency(Number(invoice.subtotal))}
                          </span>
                          <Link 
                            href={`/builder?id=${invoice.id}`} 
                            className="bg-black/5 hover:bg-black text-black hover:text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition"
                          >
                            Edit &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}