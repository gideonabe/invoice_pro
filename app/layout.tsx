// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import { Toaster } from "sonner"; // <-- Add this import
// import "./globals.css";

// const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

// export const metadata: Metadata = {
//   title: "InvoicePro | Premium Invoicing for Creators",
//   description: "Generate, share, and manage professional invoices in seconds.",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" className="scroll-smooth">
//       <body
//         className={`${inter.className} bg-black text-slate-50 antialiased selection:bg-indigo-500/30 selection:text-indigo-200`}
//       >
//         {children}
//         {/* ADD THIS: The Toaster provider set to match our premium dark theme */}
//         <Toaster theme="dark" position="bottom-right" richColors closeButton />
//       </body>
//     </html>
//   );
// }




import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "InvoicePro | Premium Invoicing for Creators",
  description: "Generate, share, and manage professional invoices in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body suppressHydrationWarning className={`${inter.className} antialiased selection:bg-black selection:text-white`}>
        {children}
        <Toaster theme="dark" position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}