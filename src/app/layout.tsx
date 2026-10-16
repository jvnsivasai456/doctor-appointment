import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MediBook AI – Smart AI Doctor Appointment System",
  description: "Describe symptoms in plain language, get routed to the right specialty without medical jargon, and book doctor appointments in under 45 seconds with zero double-booking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased selection:bg-brand-500 selection:text-white bg-medical-pattern relative overflow-x-hidden`}>
        {/* Ambient background glows */}
        <div className="fixed top-0 left-1/4 -translate-x-1/2 w-[550px] h-[550px] ambient-glow-teal rounded-full pointer-events-none -z-10 blur-3xl opacity-70 dark:opacity-40" />
        <div className="fixed top-1/3 right-0 translate-x-1/3 w-[600px] h-[600px] ambient-glow-sky rounded-full pointer-events-none -z-10 blur-3xl opacity-60 dark:opacity-30" />
        <div className="fixed -bottom-24 left-1/3 w-[500px] h-[500px] ambient-glow-teal rounded-full pointer-events-none -z-10 blur-3xl opacity-50 dark:opacity-20" />

        <Providers>
          <Navbar />
          <main className="flex-1 relative z-0">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
