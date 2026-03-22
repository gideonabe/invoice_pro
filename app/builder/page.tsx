'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import PremiumDarkTemplate from '@/components/PremiumDarkTemplate';
import { Lock } from 'lucide-react';

const formatCurrency = (amount: number) => {
  return '₦' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// We wrap the builder in a sub-component so we can use Suspense
function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('id'); // Get ID from URL if editing

  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [tier, setTier] = useState('free'); 
  const [activeTemplate, setActiveTemplate] = useState('standard');

  const [logo, setLogo] = useState<string | null>(null);
  const [companyDetails, setCompanyDetails] = useState({ name: '', web: '', email: '', phone: '', address: '' });
  const [invoiceDetails, setInvoiceDetails] = useState({ number: '', date: '', status: 'Not paid', customerName: 'Customer Name', customerPhone: 'Phone Number' });
  const [items, setItems] = useState([{ id: 1, name: '', qty: 1, rate: 0 }]);
  const [paymentDetails, setPaymentDetails] = useState({ paidAmount: 0, method: 'BANK', transactionDate: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);

    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const num = Math.floor(10000 + Math.random() * 90000);
      const today = new Date().toISOString().split('T')[0];
      
      let tempInvoiceDetails = { number: `#${num}`, date: today, status: 'Not paid', customerName: '', customerPhone: '' };
      let tempPaymentDetails = { paidAmount: 0, method: 'BANK', transactionDate: today };

      if (session?.user) {
        setUser(session.user);
        
        // 1. Get user Tier
        const { data: profile } = await supabase.from('profiles').select('tier').eq('id', session.user.id).single();
        if (profile) setTier(profile.tier);

        // 2. Are we editing an existing invoice?
        if (invoiceId) {
          const { data: inv } = await supabase.from('invoices').select('*').eq('id', invoiceId).single();
          if (inv) {
            tempInvoiceDetails = { number: inv.invoice_number, date: inv.issue_date, status: inv.status, customerName: inv.customer_name, customerPhone: inv.customer_phone || '' };
            tempPaymentDetails = { paidAmount: Number(inv.amount_paid), method: inv.payment_method || 'BANK', transactionDate: inv.created_at.split('T')[0] };
            if (inv.template_used) setActiveTemplate(inv.template_used);

            const { data: itemsData } = await supabase.from('invoice_items').select('*').eq('invoice_id', invoiceId);
            if (itemsData && itemsData.length > 0) {
              setItems(itemsData.map(i => ({ id: i.id, name: i.description, qty: i.quantity, rate: Number(i.rate) })));
            }

            if (inv.company_id) {
              const { data: comp } = await supabase.from('companies').select('*').eq('id', inv.company_id).single();
              if (comp) setCompanyDetails({ name: comp.name, web: comp.website || '', email: comp.email || '', phone: comp.phone || '', address: comp.address || '' });
            }
          }
        } else {
          // 3. NEW INVOICE: Auto-fill brand details from their most recent company profile
          const { data: comp } = await supabase.from('companies').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(1).single();
          if (comp) setCompanyDetails({ name: comp.name, web: comp.website || '', email: comp.email || '', phone: comp.phone || '', address: comp.address || '' });
        }
      } else {
        const savedSettings = localStorage.getItem('universalInvoiceSettings');
        if (savedSettings) setCompanyDetails(JSON.parse(savedSettings));
      }

      const savedLogo = localStorage.getItem('universalInvoiceLogo');
      if (savedLogo) setLogo(savedLogo);

      setInvoiceDetails(tempInvoiceDetails);
      setPaymentDetails(tempPaymentDetails);
    };
    
    loadData();
  }, [invoiceId]);

  const subtotal = items.reduce((acc, item) => acc + (item.qty * item.rate), 0);
  const balance = Math.max(0, subtotal - paymentDetails.paidAmount);

  useEffect(() => {
    if (!isMounted) return;
    let newStatus = 'Not paid';
    if (paymentDetails.paidAmount > 0) newStatus = balance > 0 ? 'Part-paid' : 'Paid';
    setInvoiceDetails(prev => ({ ...prev, status: newStatus }));
  }, [paymentDetails.paidAmount, balance, isMounted]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setLogo(base64);
        localStorage.setItem('universalInvoiceLogo', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLogo(null);
    localStorage.removeItem('universalInvoiceLogo');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addItem = () => setItems([...items, { id: Date.now(), name: '', qty: 1, rate: 0 }]);
  const removeItem = (id: number) => setItems(items.filter(item => item.id !== id));
  const updateItem = (id: number, field: string, value: string | number) => setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));

  const shareInvoice = () => {
    const shareText = `Hello ${invoiceDetails.customerName},\n\nHere are the details for your recent order (${invoiceDetails.number}) with ${companyDetails.name || 'our business'}.\n\nTotal: ${formatCurrency(subtotal)}\nStatus: ${invoiceDetails.status}${invoiceDetails.status !== 'Paid' ? `\nRemaining Balance: ${formatCurrency(balance)}` : ''}\n\nThank you for doing business with us!`;
    if (navigator.share) { navigator.share({ title: `Invoice ${invoiceDetails.number}`, text: shareText }).catch(console.error); } 
    else { window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank'); }
  };

  const saveInvoiceToCloud = async () => {
    if (!user) {
      toast.error('Authentication Required', { description: 'Please sign in to save your invoices securely to the cloud.' });
      router.push('/login');
      return;
    }
    const toastId = toast.loading('Saving to ledger...');
    try {
      const { data: companyData, error: companyError } = await supabase.from('companies').upsert([{
        user_id: user.id, name: companyDetails.name, email: companyDetails.email, phone: companyDetails.phone, address: companyDetails.address
      }]).select().single();
      if (companyError) throw companyError;

      const invoicePayload: any = {
        user_id: user.id, company_id: companyData.id, invoice_number: invoiceDetails.number, customer_name: invoiceDetails.customerName, customer_phone: invoiceDetails.customerPhone, issue_date: invoiceDetails.date, status: invoiceDetails.status, subtotal: subtotal, amount_paid: paymentDetails.paidAmount, payment_method: paymentDetails.method, template_used: activeTemplate
      };
      if (invoiceId) invoicePayload.id = invoiceId; 

      const { data: invoiceData, error: invoiceError } = await supabase.from('invoices').upsert([invoicePayload]).select().single();
      if (invoiceError) throw invoiceError;

      await supabase.from('invoice_items').delete().eq('invoice_id', invoiceData.id);
      const itemsToInsert = items.map(item => ({ invoice_id: invoiceData.id, description: item.name, quantity: item.qty, rate: item.rate }));
      const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      toast.success(invoiceId ? 'Invoice updated!' : 'Invoice saved successfully!', { id: toastId, description: 'View it in your Dashboard workspace.' });
      if (!invoiceId) router.push('/dashboard');
    } catch (error) {
      console.error("Error saving:", error);
      toast.error('Failed to save invoice.', { id: toastId, description: 'Database sync failed. Try again.' });
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#F4F4F2] text-[#0F0F0F] font-sans selection:bg-black selection:text-white pb-24">
      
      <nav className="print:hidden sticky top-0 z-50 border-b border-black/10 bg-[#F4F4F2]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold tracking-tighter hover:opacity-50 transition">
            <span className="text-xl">&larr;</span> Workspace
          </Link>

          <div className="hidden md:flex bg-white p-1 rounded-full border border-black/5 shadow-sm gap-1">
            <button 
              onClick={() => setActiveTemplate('standard')}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition ${activeTemplate === 'standard' ? 'bg-[#0F0F0F] text-white' : 'text-black/50 hover:text-black'}`}
            >
              Standard
            </button>
            <button 
              onClick={() => setActiveTemplate('premium-dark')}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition flex items-center gap-2 ${activeTemplate === 'premium-dark' ? 'bg-[#A855F7] text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'text-black/50 hover:text-black'}`}
            >
              Executive {tier !== 'pro' && <Lock className='w-6 h-6' />}
            </button>
          </div>

          <div className="flex gap-3 items-center">
            {user ? (
              <button onClick={saveInvoiceToCloud} className="text-xs font-bold uppercase tracking-widest text-black/50 hover:text-black mr-4 transition">
                {invoiceId ? 'Update Ledger' : 'Save Invoice'}
              </button>
            ) : (
              <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-[#A855F7] hover:opacity-70 mr-4 transition">
                Sign in to Save
              </Link>
            )}
            <button onClick={shareInvoice} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-emerald-100 transition shadow-sm">
              WhatsApp
            </button>
            <button onClick={() => window.print()} className="bg-[#0F0F0F] text-[#F4F4F2] px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition shadow-sm">
              PDF
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-12 print:pt-0 px-6">
        
        {activeTemplate === 'premium-dark' ? (
          tier === 'pro' ? (
            <PremiumDarkTemplate 
              logo={logo} companyDetails={companyDetails} invoiceDetails={invoiceDetails}
              items={items} paymentDetails={paymentDetails} subtotal={subtotal} balance={balance} formatCurrency={formatCurrency}
            />
          ) : (
            <div className="max-w-[900px] mx-auto bg-white border border-black/10 rounded-3xl p-16 text-center shadow-sm flex flex-col items-center justify-center min-h-[600px]">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white rounded-full flex items-center justify-center text-3xl mb-8 shadow-xl"><Lock className='w-6 h-6' /></div>
              <h2 className="text-4xl font-medium tracking-tighter mb-4">Executive Design Locked</h2>
              <p className="text-black/50 mb-10 max-w-md text-lg leading-relaxed">
                Upgrade to Premium to unlock the dark mode template, remove branding, and access advanced dashboard analytics.
              </p>
              <Link href="/#pricing" className="bg-[#0F0F0F] text-[#F4F4F2] px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-black/80 transition shadow-xl">
                Upgrade to Premium &rarr;
              </Link>
            </div>
          )
        ) : (
          <div className="max-w-[900px] mx-auto bg-white p-8 sm:p-12 print:p-0 shadow-lg border border-black/5 sm:rounded-2xl print:shadow-none print:border-none print:rounded-none text-gray-800">
            <style dangerouslySetInnerHTML={{__html: `@media print { @page { margin: 0; size: auto; } body { background-color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } input, textarea, select { border: none !important; background: transparent !important; resize: none !important; outline: none !important; box-shadow: none !important; } input::placeholder, textarea::placeholder { color: transparent !important; } }`}} />

            <div className="flex flex-col md:flex-row print:flex-row justify-between items-start mb-8 gap-6 print:gap-0">
              <div className="flex flex-col items-start gap-4 w-full md:w-1/2 print:w-1/2">
                <div onClick={() => fileInputRef.current?.click()} className="w-32 h-24 flex flex-col items-center justify-center text-center relative group cursor-pointer border-2 border-dashed border-gray-300 rounded hover:bg-gray-50 print:border-none transition">
                  {logo ? (
                    <><img src={logo} alt="Logo" className="max-w-full max-h-full object-contain p-1" /><button onClick={handleRemoveLogo} className="print:hidden hidden group-hover:flex absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 items-center justify-center text-xs font-bold shadow hover:bg-red-600">&times;</button></>
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center justify-center w-full h-full print:hidden"><span className="text-2xl mt-1">📸</span><span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Add Logo</span></div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </div>
                <div className="w-full pr-4 flex flex-col gap-1">
                  <input type="text" value={companyDetails.name} onChange={e => setCompanyDetails({...companyDetails, name: e.target.value})} className="text-xl font-bold text-black w-full bg-transparent outline-none focus:bg-gray-50 p-1 rounded" placeholder="Your Brand Name" />
                  <input type="text" value={companyDetails.web} onChange={e => setCompanyDetails({...companyDetails, web: e.target.value})} className="text-indigo-600 w-full bg-transparent outline-none focus:bg-gray-50 p-1 rounded" placeholder="yourwebsite.com" />
                  <input type="text" value={companyDetails.email} onChange={e => setCompanyDetails({...companyDetails, email: e.target.value})} className="text-gray-600 w-full bg-transparent outline-none focus:bg-gray-50 p-1 rounded" placeholder="contact@yourbrand.com" />
                  <input type="text" value={companyDetails.phone} onChange={e => setCompanyDetails({...companyDetails, phone: e.target.value})} className="text-gray-600 w-full bg-transparent outline-none focus:bg-gray-50 p-1 rounded" placeholder="+123 456 7890" />
                </div>
              </div>
              <div className="text-left md:text-right print:text-right text-gray-600 w-full md:w-1/2 print:w-1/2 flex flex-col items-start md:items-end print:items-end">
                <h2 className="text-[28px] font-bold text-black mb-1 tracking-tight">Receipt</h2>
                <p className="font-semibold text-gray-800">Headquarters,</p>
                <textarea value={companyDetails.address} onChange={e => setCompanyDetails({...companyDetails, address: e.target.value})} className="w-full max-w-[250px] p-1 mt-1 outline-none focus:bg-gray-50 rounded min-h-[60px] text-left md:text-right print:text-right resize-none bg-transparent" placeholder="Enter your full business address here..." />
                <p className="mt-2 text-black text-xs font-semibold print:hidden bg-black/5 text-black/70 px-3 py-1 rounded-full cursor-pointer hover:bg-black/10 transition" onClick={() => setInvoiceDetails(prev => ({...prev, number: `#${Math.floor(10000 + Math.random() * 90000)}`}))}>
                  Order #: {invoiceDetails.number} <span className="text-[10px] ml-1 font-normal opacity-70">(Click to change)</span>
                </p>
                <p className="mt-1 text-black text-xs font-semibold hidden print:block">Order number: {invoiceDetails.number}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-5 pb-5 flex flex-col md:flex-row print:flex-row justify-between gap-6 print:gap-0">
              <div className="w-full md:w-1/3 print:w-1/3">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Shipped To:</p>
                <input type="text" value={invoiceDetails.customerName} onChange={e => setInvoiceDetails({...invoiceDetails, customerName: e.target.value})} className="block w-full text-black bg-transparent outline-none focus:bg-gray-50 p-1 rounded font-semibold" placeholder="Customer Name" />
                <input type="text" value={invoiceDetails.customerPhone} onChange={e => setInvoiceDetails({...invoiceDetails, customerPhone: e.target.value})} className="block w-full text-gray-600 bg-transparent outline-none focus:bg-gray-50 p-1 rounded" placeholder="Phone Number" />
              </div>
              <div className="w-full md:w-1/3 print:w-1/3 flex flex-col gap-2">
                <div className="flex gap-2 items-center"><span className="text-gray-400 text-xs font-bold uppercase tracking-wider w-24">Date:</span><input type="date" value={invoiceDetails.date} onChange={e => setInvoiceDetails({...invoiceDetails, date: e.target.value})} className="text-gray-800 bg-transparent outline-none focus:bg-gray-50 p-1 rounded cursor-pointer font-medium" /></div>
                <div className="flex gap-2 items-center"><span className="text-gray-400 text-xs font-bold uppercase tracking-wider w-24">Status:</span><span className={`font-bold p-1 ${invoiceDetails.status === 'Paid' ? 'text-emerald-600' : invoiceDetails.status === 'Part-paid' ? 'text-amber-500' : 'text-rose-500'}`}>{invoiceDetails.status}</span></div>
              </div>
              <div className="w-full md:w-1/3 print:w-1/3 text-left md:text-right print:text-right">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Paid</p>
                <p className="text-3xl font-black text-black tracking-tight">{formatCurrency(paymentDetails.paidAmount)}</p>
              </div>
            </div>

            <div className="overflow-x-auto print:overflow-visible w-full pb-2">
              <table className="w-full text-left border-collapse border-t border-gray-200 min-w-[600px] print:min-w-full">
                <thead>
                  <tr className="text-gray-400 text-[10px] font-bold uppercase tracking-wider border-b border-gray-200">
                    <th className="py-3 w-1/2">Item Detail</th><th className="py-3 w-[15%] text-left pl-4">Qty</th><th className="py-3 w-[15%] text-left pl-2">Rate (₦)</th><th className="py-3 w-[20%] text-right pr-4">Amount</th><th className="print:hidden w-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 group">
                      <td className="py-3 pr-2"><input type="text" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} className="w-full bg-transparent text-black outline-none focus:bg-gray-50 p-2 rounded" placeholder="Item Name / Description" /></td>
                      <td className="py-3 pl-4"><input type="number" min="1" value={item.qty || ''} onChange={e => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)} className="w-16 bg-transparent text-black font-medium outline-none focus:bg-gray-50 p-2 rounded" /></td>
                      <td className="py-3 pl-2 flex items-center mt-2">₦<input type="number" value={item.rate || ''} onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)} className="w-full bg-transparent text-black ml-1 outline-none focus:bg-gray-50 p-2 rounded" placeholder="0.00" /></td>
                      <td className="py-3 text-right pr-4 font-medium text-black">{formatCurrency(item.qty * item.rate)}</td>
                      <td className="print:hidden text-center"><button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 font-bold px-2 py-1 opacity-0 group-hover:opacity-100 transition">&times;</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addItem} className="print:hidden mt-3 text-black/50 hover:text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition"><span className="text-lg leading-none">+</span> Add Item</button>

            <div className="flex justify-end mt-4 border-b border-gray-200 pb-8">
              <div className="w-full sm:w-[60%] md:w-[45%] print:w-[45%] text-[13px]">
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500 font-medium">Subtotal</span><span className="font-semibold text-black pr-4">{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500 font-medium">Total</span><span className="font-bold text-black pr-4">{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between py-2 border-b border-gray-100 bg-gray-50/50 rounded px-2 -mx-2"><span className="text-gray-500 font-medium flex items-center">Amount Paid</span><div className="flex items-center"><span className="text-gray-400 mr-1">₦</span><input type="number" value={paymentDetails.paidAmount || ''} onChange={e => setPaymentDetails({...paymentDetails, paidAmount: parseFloat(e.target.value) || 0})} className="w-24 bg-white border border-gray-200 rounded px-2 py-1 text-right font-bold text-black print:border-none print:bg-transparent outline-none focus:border-black/20" placeholder="0.00" /></div></div>
                {balance > 0 && <div className="flex justify-between py-3 text-rose-600 bg-rose-50/50 mt-1 rounded px-2 -mx-2"><span className="font-bold uppercase tracking-wider text-xs flex items-center">Balance Due</span><span className="font-black pr-2">{formatCurrency(balance)}</span></div>}
              </div>
            </div>

            <div className="mt-8 mb-4">
              <h3 className="font-bold uppercase tracking-wider text-gray-400 text-[10px] mb-3">Transaction History</h3>
              <div className="overflow-x-auto print:overflow-visible w-full pb-2">
                <table className="w-full text-left text-[13px] min-w-[500px] print:min-w-full border-t border-gray-200">
                  <thead><tr className="text-gray-400 text-[10px] font-bold uppercase tracking-wider border-b border-gray-200"><th className="py-2 w-1/4">Ref #</th><th className="py-2 w-1/4">Method</th><th className="py-2 w-1/4">Date</th><th className="py-2 w-1/4">Amount Recorded</th></tr></thead>
                  <tbody><tr><td className="py-3 text-black font-medium">01</td><td className="py-3"><select value={paymentDetails.method} onChange={e => setPaymentDetails({...paymentDetails, method: e.target.value})} className="bg-transparent text-gray-800 font-medium outline-none focus:bg-gray-50 p-1 rounded cursor-pointer print:appearance-none"><option value="BANK">BANK TRANSFER</option><option value="CASH">CASH</option><option value="CRYPTO">CRYPTO</option><option value="POS">POS</option></select></td><td className="py-3"><input type="date" value={paymentDetails.transactionDate} onChange={e => setPaymentDetails({...paymentDetails, transactionDate: e.target.value})} className="bg-transparent text-gray-800 font-medium outline-none focus:bg-gray-50 p-1 rounded cursor-pointer" /></td><td className="py-3 font-semibold text-black">{formatCurrency(paymentDetails.paidAmount)}</td></tr></tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Next.js 13+ requires useSearchParams to be wrapped in a Suspense boundary!
export default function BuilderPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F4F2] flex items-center justify-center font-bold tracking-widest uppercase text-xs">Loading Workspace...</div>}>
      <BuilderContent />
    </Suspense>
  );
}