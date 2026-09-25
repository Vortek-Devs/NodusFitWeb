import type { Metadata } from "next";
import { FinancialPreview } from "./_components/financial-preview";

export const metadata: Metadata = {
  title: {
    absolute: "Financeiro | Nodus Fit",
  },
  description: "Preview aberto do financeiro do personal com dados mockados.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FinanceiroPage() {
  return <FinancialPreview />;
}
