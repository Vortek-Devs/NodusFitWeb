import type { Metadata } from "next";
import { FinancialPreview } from "../_components/financial-preview";

export const metadata: Metadata = {
  title: {
    absolute: "Financeiro carregando | Nodus Fit",
  },
  description: "Preview aberto do estado de carregamento do financeiro.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FinanceiroCarregandoPage() {
  return <FinancialPreview variant="loading" />;
}
