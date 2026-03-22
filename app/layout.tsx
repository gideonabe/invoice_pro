import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "InvoicePro | Premium Invoicing for Creators",
  description: "Generate, share, and manage professional invoices in seconds.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "InvoicePro | Premium Invoicing for Creators",
    description: "Generate, share, and manage professional invoices in seconds.",
    url: "https://invoicepro.vercel.app/",
    siteName: "InvoicePro",
    images: [
      {
        url: "/thumbnail.png",
        width: 1200,
        height: 630,
        alt: "InvoicePro Hero",
      },
    ],
    locale: "en_US",
    type: "website",
  },
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