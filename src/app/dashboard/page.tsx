import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard do Personal",
  description: "Preview aberto do dashboard do personal com dados mockados.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return (
    <iframe
      className="block h-dvh w-full border-0 bg-[#07100D]"
      src="/mockups/nodus_fit_dashboard_personal.html"
      title="Dashboard do Personal"
    />
  );
}
