import type { Metadata } from "next";
import { FinancialPreview } from "../_components/financial-preview";

export const metadata: Metadata = {
  title: {
    absolute: "Registrar pagamento | Nodus Fit",
  },
  description: "Preview aberto do modal de registro de pagamento.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FinanceiroPagamentoPage() {
  return <FinancialPreview variant="payment" />;
}
