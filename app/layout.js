import { Geist, Geist_Mono } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

export const metadata = {
  title: "BT:WN",
  description: "UCLA small business directory",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* SiteHeader is a client component — renders search bar on non-home pages */}
        <SiteHeader />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
