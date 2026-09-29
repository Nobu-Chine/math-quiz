import type { Metadata } from "next";

export const metadata: Metadata = { title: "理科クイズ" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
