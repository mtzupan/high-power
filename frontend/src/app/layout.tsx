import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "High Power - Wind Turbine Discovery",
  description: "Discover and manage wind turbines",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
