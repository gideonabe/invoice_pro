// 'use client';

// import { useState } from 'react';
// import { supabase } from '@/lib/supabase';
// import Link from 'next/link';

// export default function LoginPage() {
//   const [email, setEmail] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage('');

//     // This single line triggers the Magic Link email via Supabase!
//     const { error } = await supabase.auth.signInWithOtp({
//       email,
//       options: {
//         // This tells Supabase where to send the user after they click the link
//         emailRedirectTo: `${window.location.origin}/auth/callback`,
//       },
//     });

//     if (error) {
//       setMessage(error.message);
//     } else {
//       setMessage('Check your email for the magic link!');
//       setEmail('');
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
//       {/* Background Glow */}
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>

//       <div className="max-w-md w-full relative z-10 border border-white/10 bg-zinc-950/50 backdrop-blur-xl p-10 rounded-3xl shadow-2xl">
//         <div className="text-center mb-10">
//           <Link href="/" className="inline-flex items-center justify-center w-12 h-12 bg-white text-black rounded-xl font-bold text-xl mb-6">
//             I
//           </Link>
//           <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome back</h1>
//           <p className="text-zinc-400">Sign in to save and manage your invoices.</p>
//         </div>

//         <form onSubmit={handleLogin} className="space-y-4">
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-2">Email address</label>
//             <input
//               id="email"
//               type="email"
//               required
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
//               placeholder="you@company.com"
//             />
//           </div>
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-white text-black font-semibold rounded-xl px-4 py-3 hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//           >
//             {loading ? 'Sending link...' : 'Send Magic Link'}
//           </button>
//         </form>

//         {message && (
//           <div className={`mt-6 p-4 rounded-xl text-sm text-center border ${message.includes('Check your email') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
//             {message}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }





'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('✽ Secure link dispatched to your inbox.');
      setEmail('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F2] text-[#0F0F0F] flex items-center justify-center p-6 selection:bg-black selection:text-white relative overflow-hidden">
      
      {/* Background Architectural Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full relative z-10 bg-white border border-black/10 p-10 md:p-12 rounded-3xl shadow-2xl"
      >
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center justify-center w-12 h-12 bg-[#0F0F0F] text-[#F4F4F2] rounded-full text-xl mb-8 hover:scale-105 transition-transform">
            ✽
          </Link>
          <h1 className="text-4xl font-medium tracking-tighter mb-2 leading-tight">Access your<br/>workspace.</h1>
          <p className="text-black/50 text-sm font-medium">Passwordless entry. Enter your email to receive a secure login link.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-xs font-bold tracking-widest uppercase text-black/40 mb-3">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F4F4F2] border border-black/5 rounded-xl px-5 py-4 text-black placeholder-black/30 focus:outline-none focus:border-black/20 focus:bg-white transition-all text-sm font-medium"
              placeholder="you@agency.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F0F0F] text-[#F4F4F2] font-semibold rounded-xl px-5 py-4 hover:bg-black/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Send Magic Link \u2192'}
          </button>
        </form>

        {message && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            className={`mt-6 p-4 rounded-xl text-sm font-medium border ${message.includes('Secure link') ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}
          >
            {message}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}