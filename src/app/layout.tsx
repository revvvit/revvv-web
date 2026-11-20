import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { InlineScript } from "@/components/inline-script";
import { ThemeSwitch } from "@/components/theme-switch";
import { themeInitScript } from "@/lib/theme";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "revvv.it",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the inline theme script adds the `dark` class before React hydrates.
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <InlineScript html={themeInitScript} />
      </head>
      <body className="flex min-h-full flex-col">
        <header className="flex items-center justify-end px-4 py-3">
          <ThemeSwitch />
        </header>
        {children}
      </body>
    </html>
  );
}
