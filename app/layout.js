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

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12.1 20.2 5.55 13.9a4.47 4.47 0 0 1 0-6.38 4.68 4.68 0 0 1 6.53 0l.22.22.22-.22a4.68 4.68 0 0 1 6.53 0 4.47 4.47 0 0 1 0 6.38L12.1 20.2Zm-5.14-8.02 5.14 4.95 5.14-4.95a2.5 2.5 0 0 0 0-3.56 2.62 2.62 0 0 0-3.65 0L12.1 10.06 10.6 8.62a2.62 2.62 0 0 0-3.65 0 2.5 2.5 0 0 0 0 3.56Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <header className="site-header">
          <div className="container row">
            <Link href="/" className="brand">
              BT:WN
            </Link>
            <nav className="row site-nav" aria-label="Primary">
              <Link href="/signup" className="icon-link" aria-label="Saved businesses">
                <HeartIcon />
              </Link>
              <Link href="/signup" className="text-link">
                Write a Review
              </Link>
              <Link href="/admin/add-business" className="button header-cta">
                Add Your Business
              </Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
