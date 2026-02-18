import type { Metadata } from "next";
import "./globals.css";
import { WindSpeedProvider } from "@/context/WindSpeedContext";

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
      <body className="antialiased font-mono">
        <WindSpeedProvider>{children}</WindSpeedProvider>
      </body>
    </html>
  );
}
