import type { Metadata } from "next";
import { FinancialPreview } from "../_components/financial-preview";

export const metadata: Metadata = {
  title: {
    absolute: "Financeiro vazio | Nodus Fit",
  },
  description: "Preview aberto do estado vazio do financeiro.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FinanceiroVazioPage() {
  return <FinancialPreview variant="empty" />;
}
