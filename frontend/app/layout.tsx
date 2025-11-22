import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ParkShare - Find Parking in Vancouver",
  description: "Rent private parking spots in Vancouver",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
