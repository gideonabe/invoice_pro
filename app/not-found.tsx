import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F4F4F2] text-[#0F0F0F] flex flex-col items-center justify-center px-6 selection:bg-black selection:text-white">
      <div className="max-w-4xl w-full border-4 border-black p-12 md:p-20 relative overflow-hidden bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        {/* Architectural Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        <h1 className="text-[12vw] font-black leading-none tracking-tighter mb-8 break-all">
          404_ERROR
        </h1>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="max-w-sm">
            <p className="font-mono uppercase tracking-widest text-xs mb-4 text-black/40 font-bold">
              [Status: Resource Not Found]
            </p>
            <p className="text-xl md:text-2xl font-medium leading-tight tracking-tight mb-8">
              The ledger entry you are looking for has been moved, deleted, or never existed in this workspace.
            </p>
            <Link 
              href="/" 
              className="inline-block bg-[#0F0F0F] text-[#F4F4F2] px-8 py-4 text-sm font-bold uppercase tracking-widest hover:translate-x-2 hover:-translate-y-2 transition-transform shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              Back to Dashboard &rarr;
            </Link>
          </div>
          
          <div className="text-[10vw] font-black leading-none opacity-10 select-none">
            ✽
          </div>
        </div>
      </div>
    </div>
  );
}