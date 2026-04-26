// Frontend root layout
import type { Metadata } from "next";
import { ToastProvider } from "../components/ToastProvider";
import { ThemeProvider } from "../contexts/ThemeContext";
import "../styles/index.css";
import "../styles/animations.css";

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
      <head>
        <link rel="icon" href="/images/UniLodge.png" />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
