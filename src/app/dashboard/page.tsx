import type { Metadata } from "next";
import {
  MockupContentFrame,
  PersonalPreviewShell,
} from "../_components/personal-preview-shell";

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
    <PersonalPreviewShell active="dashboard">
      <MockupContentFrame
        hideMockSidebar
        src="/mockups/nodus_fit_dashboard_personal.html"
        title="Dashboard do Personal"
      />
    </PersonalPreviewShell>
  );
}
