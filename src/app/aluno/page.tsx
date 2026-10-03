import type { Metadata } from "next";
import { requireStudentAccess } from "@/lib/auth/student-access";

export const metadata: Metadata = {
  title: "Área do aluno | Nodus Fit",
  robots: { index: false, follow: false },
};

export default async function StudentHomePage() {
  const student = await requireStudentAccess();

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-3xl rounded-2xl border border-border bg-elevated p-6 shadow-card sm:p-8">
        <p className="text-sm font-semibold tracking-wide text-ink-brand">NODUS FIT</p>
        <h1 className="mt-3 text-3xl font-bold text-ink-primary">Olá, {student.name}</h1>
        <p className="mt-3 text-ink-secondary">
          Seu acesso de aluno está ativo. Seus treinos aparecerão aqui quando estiverem
          disponíveis.
        </p>
      </section>
    </main>
  );
}
