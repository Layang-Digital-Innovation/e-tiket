import type { Metadata } from "next";
import { PT_Sans, PT_Serif } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/lib/react-query";
import { AuthInitializer } from "@/components/auth/AuthInitializer";

const ptSans = PT_Sans({
  variable: "--font-pt-sans",
  weight: ["400", "700"],
  subsets: ["latin"],
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
      <body
        className={`${ptSans.variable} ${ptSerif.variable} antialiased`}
      >
        <ReactQueryProvider>
          <AuthInitializer />
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
