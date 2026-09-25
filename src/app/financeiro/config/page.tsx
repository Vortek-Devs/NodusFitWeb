import type { Metadata } from "next";
import { FinancialPreview } from "../_components/financial-preview";

export const metadata: Metadata = {
  title: {
    absolute: "Configurar financeiro | Nodus Fit",
  },
  description: "Preview aberto do modal de configuracao financeira.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FinanceiroConfigPage() {
  return <FinancialPreview variant="config" />;
}
