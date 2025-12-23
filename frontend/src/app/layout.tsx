import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Web3Provider } from "@/providers/Web3Provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Hexific - AI Smart Contract Audit",
  description: "AI-powered smart contract security auditing platform using Slither and Claude AI. Get comprehensive vulnerability reports for your Ethereum smart contracts.",
  keywords: ["smart contract", "audit", "security", "ethereum", "solidity", "blockchain", "AI", "vulnerability"],
  authors: [{ name: "Hexific Team" }],
  openGraph: {
    title: "Hexific - AI Smart Contract Audit",
    description: "AI-powered smart contract security auditing platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        {/* Background Effects */}
        <div className="bg-grid" />
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />
        <div className="glow-orb glow-orb-3" />
        
        {/* Web3 Provider */}
        <Web3Provider>
          {/* Main Content */}
          {children}
        </Web3Provider>
        
        {/* Toast Notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-lg)',
            },
            success: {
              iconTheme: {
                primary: 'var(--success)',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--danger)',
                secondary: 'white',
              },
            },
          }}
        />
      </body>
    </html>
  );
}

