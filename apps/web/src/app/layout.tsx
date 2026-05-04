import type { Metadata } from "next";
import { Inter, Teachers } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { SessionProvider } from "@/providers/SessionProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const teachers = Teachers({
  subsets: ["latin"],
  variable: "--font-teachers",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: { default: "Agile PM", template: "%s · Agile PM" },
  description:
    "Professional Agile project management — Kanban, sprints, analytics, and team collaboration in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${teachers.variable}`}>
      <body className="font-sans antialiased">
        <SessionProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </SessionProvider>
      </body>
    </html>
  );
}
