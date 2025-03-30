import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.WEBSITE_URL || "https://www.google.com"),
  title: {
    template: "%s | Project",
    default: "Projects",
  },
  description: "",
  applicationName: "",
  authors: [{ name: "Ansh Yadav" }],
  keywords: [''],
  creator: "Ansh yadav",
  publisher: ""
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-lime-950 selection:text-lime-500 text-green-950`}>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
