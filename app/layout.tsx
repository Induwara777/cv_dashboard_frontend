import type { Metadata } from "next";
import "./globals.css";
// Remove this import
// import NavBar from "@/component/NavBar";

export const metadata: Metadata = {
  title: "Pro Talent Scout — TA Review Panel",
  description: "Manual review panel for ranked candidates",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-slate-100">
        {/* Remove this line */}
        {/* <NavBar /> */}
        {children}
      </body>
    </html>
  );
}