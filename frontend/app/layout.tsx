import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SME Projects | Practical ideas, real impact",
  description: "A shared workspace connecting SME challenges with student talent.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
