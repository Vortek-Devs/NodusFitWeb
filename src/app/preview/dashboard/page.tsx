import type { Metadata } from "next";
import { DashboardPreview } from "./_components/dashboard-preview";

export const metadata: Metadata = {
  title: "Dashboard do Personal (demonstração)",
  description: "Demonstração não autenticada com dados ilustrativos.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return <DashboardPreview />;
}
