import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "BT:WN",
  description: "UCLA small business directory",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container row">
            <Link href="/" className="brand">
              BT:WN
            </Link>
            <nav className="row site-nav" aria-label="Primary">
              <Link href="/explore" className="text-link">
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
