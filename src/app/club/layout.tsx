import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Punti Club",
  description: "Aprender IA en Punti es gratis, siempre. Punti Club es para ir más rápido, más profundo y demostrarlo.",
};

export default function ClubLayout({ children }: { children: React.ReactNode }) {
  return children;
}
