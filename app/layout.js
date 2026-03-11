import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

export const metadata = {
  title: "BT:WN",
  description: "UCLA small business directory",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* SiteHeader is a client component — renders search bar on non-home pages */}
        <SiteHeader />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
