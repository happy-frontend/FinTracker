import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { ClientLayout } from "@/components/layout/client-layout";

const inter = Inter({ 
    subsets: ["latin"],
    variable: "--font-inter",
});

const manrope = Manrope({
    subsets: ["latin"],
    variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Crockery Tracker | The Digital Curator",
  description: "Bespoke finance and inventory management for premium crockery assets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className="bg-surface text-on-surface flex h-screen overflow-hidden antialiased font-body">
        <ClientLayout>{children}</ClientLayout>
        <Toaster theme="light" position="top-right" richColors />
      </body>
    </html>
  );
}
