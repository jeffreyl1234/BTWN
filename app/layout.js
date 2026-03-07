import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "BTWN",
  description: "UCLA small business directory",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <header className="site-header">
          <div className="container row">
            <Link href="/" className="brand">
              BT:WN
            </Link>
            <nav className="row site-nav">
              <Link href="/explore">Explore</Link>
              <Link href="/admin/add-business">Add Your Business</Link>
              <Link href="/signup" className="button button-secondary">
                Sign Up
              </Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
