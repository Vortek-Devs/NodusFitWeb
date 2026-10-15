import type { Metadata } from "next";
import { HomeOverviewClient } from "@/components/dashboard/home-overview-client";

export const metadata: Metadata = {
  title: "Início | Nodus Fit",
  robots: { index: false, follow: false },
};

export default function HomePage() {
  return <HomeOverviewClient />;
}
