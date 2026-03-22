'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Star } from 'lucide-react'; // Professional Icons

// Custom easing for that "Apple / Top Tech" buttery smooth feel
const premiumEasing = [0.16, 1, 0.3, 1] as const;

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.authorization_url) {
        window.location.href = data.authorization_url;
      } else if (res.status === 401) {
        toast.error('Account Required', { description: 'Please sign in to secure your subscription.' });
        router.push('/login');
      } else {
        toast.error(data.error || 'Something went wrong.');
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error('Failed to connect to secure checkout.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F2] text-[#0F0F0F] font-sans overflow-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: inline-block; white-space: nowrap; animation: marquee 20s linear infinite; }
      `}} />

      {/* NAVBAR */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: premiumEasing }}
        className="fixed top-0 w-full z-50 bg-[#F4F4F2]/90 backdrop-blur-md px-6 py-5 flex justify-between items-center"
      >
        <div className="font-bold text-2xl tracking-tighter flex items-center gap-1">
          InvoicePro <span className="text-xl">✽</span>
        </div>
        
        <div className="hidden md:flex bg-white rounded-full px-6 py-2.5 shadow-sm border border-black/5 gap-8 text-xs font-semibold tracking-widest uppercase">
          <Link href="#features" className="hover:opacity-50 transition">Features</Link>
          <Link href="#templates" className="hover:opacity-50 transition">Vault</Link>
          <Link href="#pricing" className="hover:opacity-50 transition">Pricing</Link>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/login" className="hidden sm:block text-sm font-medium hover:opacity-50 transition">Log in</Link>
          <Link href="/builder" className="bg-[#0F0F0F] text-[#F4F4F2] px-6 py-3 rounded-full text-sm font-medium hover:bg-black/80 transition">
            Start free &rarr;
          </Link>
        </div>
      </motion.nav>

      {/* HERO SECTION */}
      <main className="pt-40 pb-12 relative z-10">
        <div className="max-w-[95%] mx-auto px-4 md:px-8 text-center md:text-left flex flex-col md:flex-row justify-between items-end mb-12">
          
          <div className="overflow-hidden mb-6 md:mb-0">
            <motion.h1 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: premiumEasing, delay: 0.1 }}
              className="text-[12vw] md:text-[8vw] leading-[0.9] font-medium tracking-tighter"
            >
              We generate first<br />
              <span className="flex items-center justify-center md:justify-start gap-4 md:gap-8">
                <svg className="w-[8vw] h-[8vw] md:w-[5vw] md:h-[5vw] animate-[spin_10s_linear_infinite]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2v20M2 12h20M4.929 4.929l14.142 14.142M4.929 19.071L19.071 4.929"/></svg>
                class Invoices
              </span>
            </motion.h1>
          </div>

          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
            className="max-w-xs text-left hidden md:block"
          >
            <p className="text-xs uppercase tracking-widest font-semibold text-black/50 mb-2">InvoicePro is a studio focusing solely on financial aesthetics.</p>
            <Link href="#templates" className="text-sm font-medium border-b border-black pb-0.5 hover:opacity-50 transition">
              &#8600; Explore templates
            </Link>
          </motion.div>
        </div>

        {/* Marquee */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="border-y border-black/10 py-3 overflow-hidden flex bg-white/50">
          <div className="animate-marquee text-xs font-semibold uppercase tracking-widest text-black/60 flex gap-8 whitespace-nowrap">
            <span>✽ Minimalist</span><span>&rarr;</span><span>Secure</span><span>&rarr;</span><span>Instant</span><span>&rarr;</span><span>Professional</span><span>&rarr;</span><span>Dashboard</span><span>&rarr;</span>
            <span>✽ Minimalist</span><span>&rarr;</span><span>Secure</span><span>&rarr;</span><span>Instant</span><span>&rarr;</span><span>Professional</span><span>&rarr;</span><span>Dashboard</span><span>&rarr;</span>
          </div>
        </motion.div>

        {/* Abstract Hero Graphic */}
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: premiumEasing, delay: 0.3 }}
          className="max-w-[95%] mx-auto mt-12 relative group cursor-pointer"
        >
          <div className="bg-[#EAEAE8] rounded-3xl h-[50vh] md:h-[70vh] w-full overflow-hidden border border-black/5 relative flex items-center justify-center">
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:40px_40px]"></div>
             
             <motion.div whileHover={{ rotate: 0, scale: 1.05 }} transition={{ duration: 0.5 }} className="w-[300px] h-[400px] bg-white rounded-xl shadow-2xl z-10 flex flex-col p-6 transform -rotate-6">
               <div className="w-12 h-12 bg-black rounded-full mb-8 flex items-center justify-center text-white text-xl">✽</div>
               <div className="w-1/2 h-2 bg-black/10 mb-2"></div>
               <div className="w-3/4 h-2 bg-black/10 mb-12"></div>
               <div className="text-4xl font-medium tracking-tighter mb-4">₦12,500.00</div>
               <div className="w-full h-[1px] bg-black/10 mb-4"></div>
               <div className="w-full h-8 bg-black/5 rounded"></div>
             </motion.div>
             
             <div className="w-[350px] h-[300px] bg-[#0F0F0F] rounded-xl shadow-2xl z-0 absolute translate-x-32 translate-y-20 flex flex-col p-8 text-white transform rotate-3 hidden md:flex">
               <div className="w-full h-4 bg-white/20 rounded mb-8"></div>
               <div className="flex-1 border border-white/20 rounded"></div>
             </div>
          </div>
        </motion.div>
      </main>

      {/* STATEMENT SECTION */}
      <section className="py-32 relative overflow-hidden flex items-center justify-center">
        <motion.div 
          initial={{ x: "10%" }}
          whileInView={{ x: "-10%" }}
          transition={{ duration: 5, ease: "linear" }}
          className="absolute whitespace-nowrap text-[25vw] font-bold text-black/[0.03] tracking-tighter pointer-events-none select-none z-0"
        >
          InvoicePro
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: premiumEasing }}
          className="relative z-10 max-w-4xl mx-auto px-6 text-center"
        >
          <h2 className="text-4xl md:text-6xl font-medium tracking-tighter mb-8">Leading financial tooling <br/>for modern innovators</h2>
          <p className="text-lg md:text-xl text-black/60 max-w-2xl mx-auto">
            We provide free, beautiful standard templates. Get advice on customer billing, reducing payment complexity, and elevating your agency's brand perception.
          </p>
        </motion.div>
      </section>

      {/* THE VAULT (Templates List) */}
      <section id="templates" className="max-w-[95%] mx-auto px-4 md:px-8 pb-32">
        <motion.div 
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="border-t-2 border-black pt-8 mb-16 flex justify-between items-end"
        >
          <h2 className="text-4xl font-medium tracking-tighter">The Vault</h2>
          <Link href="/builder" className="bg-black text-white px-6 py-2 rounded-full text-sm hover:bg-black/80 transition flex items-center gap-2">
            Explore all <ArrowRight size={14} />
          </Link>
        </motion.div>

        <div className="flex flex-col border-t border-black/10">
          {[
            { num: "01", name: "The Minimalist", type: "Free Tier", desc: "Clean, white, universal.", icon: null },
            { num: "02", name: "The Executive", type: "Premium", desc: "Dark mode perfection.", isPro: true, icon: <Lock size={14} strokeWidth={2.5} /> },
            { num: "03", name: "The Creator", type: "Premium", desc: "Bold accents & headers.", isPro: true, icon: <Lock size={14} strokeWidth={2.5} /> }
          ].map((tpl, i) => (
            <motion.div 
              key={tpl.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <Link href="/builder" className={`group flex flex-col md:flex-row items-baseline justify-between py-8 border-b border-black/10 hover:px-6 transition-all duration-500 ${tpl.isPro ? 'hover:bg-[#0F0F0F] hover:text-white' : 'hover:bg-white'}`}>
                <div className="flex items-baseline gap-12 w-full md:w-1/2">
                  <span className={`text-sm font-mono text-black/40 ${tpl.isPro ? 'group-hover:text-white/40' : ''}`}>{tpl.num}</span>
                  <span className={`text-sm font-mono text-black/40 ${tpl.isPro ? 'group-hover:text-white/40' : ''}`}>(+)</span>
                  <h3 className="text-2xl font-medium tracking-tighter">{tpl.name}</h3>
                </div>
                <div className={`w-full md:w-1/2 flex justify-between mt-4 md:mt-0 text-sm text-black/60 ${tpl.isPro ? 'group-hover:text-white/60' : ''}`}>
                  <span className="uppercase tracking-widest flex items-center gap-2 font-bold">
                    {tpl.type}
                    {tpl.icon && <span className="opacity-50 group-hover:opacity-100 transition-opacity">{tpl.icon}</span>}
                  </span>
                  <span>{tpl.desc}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="bg-white py-32 border-y border-black/10 overflow-hidden">
        <div className="max-w-[95%] mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-16 md:gap-32 mb-24">
            <motion.h2 
              initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: premiumEasing }}
              className="text-4xl md:text-5xl font-medium tracking-tighter leading-tight w-full md:w-1/2"
            >
              Crafting Growth<br/>Through SaaS with<br/>InvoicePro &mdash;
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease: premiumEasing }}
              className="text-lg text-black/60 w-full md:w-1/2 md:mt-2"
            >
              Elevate your journey with views: Craft, Enhance, Extend, Tailored design solutions, from idea to execution, for businesses seeking intuitive experiences.
            </motion.p>
          </div>

          <div className="flex flex-col md:flex-row gap-16">
            <motion.div 
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="w-full md:w-1/3"
            >
              <h3 className="text-3xl font-medium tracking-tighter mb-8">Design a new Invoice</h3>
              <p className="text-black/60 mb-12">We make sure your brand attracts people, solves their real needs, and converts them into paying customers through pure visual speed.</p>
              
              <div className="bg-[#F4F4F2] p-8 rounded-xl">
                <h4 className="font-semibold mb-6 uppercase tracking-widest text-xs">Perfect if you need to:</h4>
                <ul className="space-y-4 text-sm text-black/70">
                  <li className="flex items-center gap-3"><span className="text-lg">✽</span> Instantly generate PDFs</li>
                  <li className="flex items-center gap-3"><span className="text-lg">✽</span> Sync clients to the cloud</li>
                  <li className="flex items-center gap-3"><span className="text-lg">✽</span> Share directly to WhatsApp</li>
                </ul>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: premiumEasing }}
              className="w-full md:w-2/3 bg-[#EAEAE8] rounded-2xl border border-black/5 overflow-hidden flex flex-col"
            >
              <div className="p-6 flex justify-between text-xs font-mono text-black/40 border-b border-black/5">
                <span>STEP: /01 /02 /03</span><span>PROGRESS: 100%</span>
              </div>
              <div className="flex-1 p-12 flex items-center justify-center relative">
                 <div className="w-full max-w-md bg-white shadow-xl rounded-lg p-6 border border-black/10">
                   <div className="flex justify-between border-b border-black/10 pb-4 mb-4"><div className="w-1/3 h-4 bg-black/10 rounded"></div><div className="w-1/4 h-4 bg-black/10 rounded"></div></div>
                   <div className="space-y-3 mb-8"><div className="w-full h-8 bg-[#F4F4F2] rounded"></div><div className="w-full h-8 bg-[#F4F4F2] rounded"></div></div>
                   <div className="flex justify-end"><div className="w-1/3 h-8 bg-black rounded"></div></div>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PRICING & FOOTER */}
      <section id="pricing" className="bg-[#0F0F0F] text-[#F4F4F2] pt-32 pb-12">
        <div className="max-w-[95%] mx-auto px-4 md:px-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <h2 className="text-[10vw] leading-[0.9] font-medium tracking-tighter mb-4">Let's Launch Your<br/>Journey ✽✦</h2>
            <p className="text-white/50 text-xl max-w-xl mx-auto">Stop sending generic Word documents. Invest in your financial presence.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-32">
            {/* Free Plan */}
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.8 }} className="border border-white/10 p-10 rounded-2xl flex flex-col hover:bg-white/5 transition">
              <div className="flex justify-between items-start mb-12">
                <div><h3 className="text-2xl font-medium tracking-tighter">Essential</h3><p className="text-white/50 text-sm mt-1">For starters.</p></div>
                <div className="text-right"><div className="text-4xl font-medium tracking-tighter">₦0</div><div className="text-white/50 text-xs font-mono mt-1">/forever</div></div>
              </div>
              <div className="flex-1 text-sm text-white/70 space-y-4">
                <div className="flex gap-3 border-b border-white/10 pb-4"><span>+</span> Unlimited invoices</div>
                <div className="flex gap-3 border-b border-white/10 pb-4"><span>+</span> Standard Minimalist template</div>
              </div>
              <Link href="/builder" className="mt-12 w-full py-4 border border-white/20 text-center text-sm font-medium rounded-full hover:bg-white hover:text-black transition">Start for free &rarr;</Link>
            </motion.div>

            {/* Premium Plan */}
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.8 }} className="bg-[#1A1A1A] border border-white/20 p-10 rounded-2xl flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-white"></div>
              <div className="flex justify-between items-start mb-12">
                <div><h3 className="text-2xl font-medium tracking-tighter text-white">Premium</h3><p className="text-white/50 text-sm mt-1">For serious agencies.</p></div>
                <div className="text-right"><div className="text-4xl font-medium tracking-tighter text-white">₦5,000</div><div className="text-white/50 text-xs font-mono mt-1">/month</div></div>
              </div>
              <div className="flex-1 text-sm text-white/90 space-y-4">
                <div className="flex gap-3 border-b border-white/10 pb-4"><span>✽</span> All Premium Templates <Lock size={12} className="inline ml-1 opacity-50" /></div>
                <div className="flex gap-3 border-b border-white/10 pb-4"><span>✽</span> Cloud Client Database</div>
                <div className="flex gap-3 border-b border-white/10 pb-4"><span>✽</span> Dashboard Analytics</div>
              </div>
              <button onClick={handleUpgrade} disabled={isLoading} className="mt-12 w-full py-4 bg-white text-black text-center text-sm font-bold rounded-full hover:bg-white/80 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {isLoading ? 'Connecting...' : 'Upgrade to Premium \u2192'}
              </button>
            </motion.div>
          </div>

          {/* FOOTER */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center text-sm text-white/50 gap-8">
            <div className="flex flex-col gap-1">
               <span className="font-bold text-white tracking-tighter text-xl">InvoicePro</span>
               <span className="text-xs">© 2026 All rights reserved.</span>
            </div>
            
            <div className="flex gap-16">
              <div className="flex flex-col gap-2"><Link href="#" className="hover:text-white transition">Home</Link><Link href="#templates" className="hover:text-white transition">Vault</Link><Link href="#features" className="hover:text-white transition">Process</Link></div>
              <div className="flex flex-col gap-2"><Link href="#" className="hover:text-white transition">Instagram</Link><Link href="#" className="hover:text-white transition">LinkedIn</Link><Link href="#" className="hover:text-white transition">Twitter</Link></div>
            </div>

            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth'})} className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition">
              &uarr;
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}