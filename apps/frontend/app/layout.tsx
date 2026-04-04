// Frontend root layout
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UniLodge - Student Accommodation Platform",
  description: "Find your perfect student accommodation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
