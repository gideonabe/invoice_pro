import React from 'react';

// Pass the state from your main builder page into this component
export default function PremiumDarkTemplate({
  logo,
  companyDetails,
  invoiceDetails,
  items,
  paymentDetails,
  subtotal,
  balance,
  formatCurrency,
}: any) {
  return (
    <div className="max-w-[900px] mx-auto bg-[#09090b] text-zinc-300 p-8 sm:p-12 shadow-2xl shadow-indigo-500/10 border border-white/10 sm:rounded-2xl print:shadow-none print:border-none print:rounded-none relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; size: auto; }
          body { background-color: #09090b !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}} />

      {/* Header */}
      <div className="flex justify-between items-start mb-16 relative z-10 border-b border-white/10 pb-12">
        <div className="flex flex-col gap-6 w-1/2">
          {logo ? (
             <img src={logo} alt="Logo" className="max-w-[120px] max-h-[80px] object-contain rounded-md" />
          ) : (
             <div className="w-12 h-12 bg-white text-black rounded-lg flex items-center justify-center text-xl font-bold">
               {companyDetails.name ? companyDetails.name.charAt(0) : 'B'}
             </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1">{companyDetails.name || 'Brand Name'}</h1>
            <p className="text-zinc-500 text-sm">{companyDetails.web || 'website.com'}</p>
            <p className="text-zinc-500 text-sm">{companyDetails.email || 'email@brand.com'}</p>
          </div>
        </div>

        <div className="text-right w-1/2">
          <div className="inline-block border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
            Invoice
          </div>
          <p className="text-sm text-zinc-500 uppercase tracking-widest font-semibold mb-1">Invoice No.</p>
          <p className="text-3xl font-mono text-white mb-6">{invoiceDetails.number}</p>
          
          <p className="text-sm text-zinc-500 uppercase tracking-widest font-semibold mb-1">Billed To</p>
          <p className="text-white font-medium">{invoiceDetails.customerName || 'Client Name'}</p>
          <p className="text-zinc-400 text-sm">{invoiceDetails.customerPhone || 'Client Phone'}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="relative z-10 mb-12">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-zinc-500 text-xs font-bold uppercase tracking-widest border-b border-white/10">
              <th className="py-4 font-semibold w-1/2">Description</th>
              <th className="py-4 font-semibold text-center w-[15%]">Qty</th>
              <th className="py-4 font-semibold text-right w-[15%]">Rate</th>
              <th className="py-4 font-semibold text-right w-[20%]">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {items.map((item: any, index: number) => (
              <tr key={item.id} className="border-b border-white/[0.05]">
                <td className="py-5 text-zinc-200 font-medium pr-4">{item.name || `Item ${index + 1}`}</td>
                <td className="py-5 text-center font-mono text-zinc-400">{item.qty}</td>
                <td className="py-5 text-right font-mono text-zinc-400">{formatCurrency(item.rate)}</td>
                <td className="py-5 text-right font-mono text-white">{formatCurrency(item.qty * item.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals & Status */}
      <div className="flex justify-between items-end relative z-10">
        <div className="w-1/2">
           <p className="text-sm text-zinc-500 uppercase tracking-widest font-semibold mb-2">Status</p>
           <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
              invoiceDetails.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
              invoiceDetails.status === 'Part-paid' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
              'bg-rose-500/10 text-rose-400 border-rose-500/20'
           }`}>
             {invoiceDetails.status}
           </div>
           
           <div className="mt-8">
             <p className="text-sm text-zinc-500 uppercase tracking-widest font-semibold mb-1">Issue Date</p>
             <p className="text-zinc-300 font-mono text-sm">{invoiceDetails.date}</p>
           </div>
        </div>

        <div className="w-64">
          <div className="flex justify-between py-3 border-b border-white/10 text-sm">
            <span className="text-zinc-400">Subtotal</span>
            <span className="font-mono text-white">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-white/10 text-sm">
            <span className="text-zinc-400">Paid ({paymentDetails.method})</span>
            <span className="font-mono text-white">{formatCurrency(paymentDetails.paidAmount)}</span>
          </div>
          <div className="flex justify-between py-4 mt-2 bg-white/5 rounded-lg px-4 border border-white/10">
            <span className="text-white font-medium">Balance Due</span>
            <span className="font-mono text-xl text-white font-bold">{formatCurrency(balance)}</span>
          </div>
        </div>
      </div>

    </div>
  );
}