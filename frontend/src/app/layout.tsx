import type { Metadata } from "next";
import { Cormorant_Garamond, Geist_Mono, Heebo, Inter, Lora, PT_Serif } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/lib/react-query";
import Header from "@/components/header";
import { AuthProvider } from "@/contexts/AuthContext";




const heebo = Heebo({
  variable: "--font-heebo",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${heebo.variable} ${ptSerif.variable} antialiased`}
      >
        <ReactQueryProvider>
          <AuthProvider>
            <Header />
            {children}
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
