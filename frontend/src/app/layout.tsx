import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import type { ReactNode } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OptiFlow",
  description: "AI-assisted task prioritization and workflow management",
};

const themeBootScript = `
  (function() {
    try {
      var storedTheme = window.localStorage.getItem('optiflow-theme');
      var theme = storedTheme === 'light' || storedTheme === 'dark'
        ? storedTheme
        : 'light';
      document.documentElement.classList.toggle('dark', theme === 'dark');
    } catch (e) {
      document.documentElement.classList.remove('dark');
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
