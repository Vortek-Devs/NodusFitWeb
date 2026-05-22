import type { Metadata } from "next";
import { DashboardPreview } from "./_components/dashboard-preview";

export const metadata: Metadata = {
  title: "Dashboard do Personal",
  description: "Preview aberto do dashboard do personal com dados mockados.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return <DashboardPreview />;
}
