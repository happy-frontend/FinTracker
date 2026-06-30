import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { ClientLayout } from "@/components/layout/client-layout";
import { PwaRegister } from "@/components/pwa-register";

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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Crockery Tracker",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/logo_v2.png",
    apple: "/logo_v1.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#00342d",
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
        <PwaRegister />
      </body>
    </html>
  );
}
