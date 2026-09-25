import type { Metadata } from "next";
import { FinancialPreview } from "../_components/financial-preview";

export const metadata: Metadata = {
  title: {
    absolute: "Financeiro drawer | Nodus Fit",
  },
  description: "Preview aberto do drawer de historico financeiro.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FinanceiroDrawerPage() {
  return <FinancialPreview variant="drawer" />;
}
