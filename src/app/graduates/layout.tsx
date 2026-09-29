import type { Metadata } from "next";

export const metadata: Metadata = { title: "算数の卒業生" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
