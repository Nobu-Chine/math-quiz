import type { Metadata } from "next";

export const metadata: Metadata = { title: "算数ランキング" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
