import type { Metadata } from "next";
import { Figtree, PT_Serif } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/lib/react-query";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import { Toaster } from "sonner";

const figtree = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const ptSerif = PT_Serif({
  variable: "--font-pt-serif",
  weight: ["400", "700"],
  subsets: ["latin"],
}); 

export const metadata: Metadata = {
  title: "Event Ticketing System",
  description: "Platform untuk mengelola dan membeli tiket event",
  referrer: "no-referrer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${figtree.variable} ${ptSerif.variable} antialiased`}>
        <ReactQueryProvider>
          <AuthInitializer />
          {children}
          <Toaster position="top-right" richColors />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
