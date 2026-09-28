"use client";

import { type FormEvent, useState } from "react";

const specialties = [
  "Hipertrofia",
  "Emagrecimento",
  "Performance",
  "Reabilitacao",
  "Funcional",
];

type ProblemDetails = {
  detail?: string;
  errors?: Record<string, string[]>;
};

export default function OnboardingPage() {
  const [form, setForm] = useState({
    cpf: "",
    cref: "",
    telefone: "",
    especialidade: "Hipertrofia",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/backend/v1/me/personal-profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as ProblemDetails;
        const fieldErrors = Object.values(body.errors ?? {}).flat();
        setError(fieldErrors[0] ?? body.detail ?? "Não foi possível salvar o perfil.");
        return;
      }

      window.location.assign("/alunos");
    } catch {
      setError("Não foi possível salvar o perfil. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="onboarding-page">
      <section className="onboarding-shell" aria-labelledby="onboarding-title">
        <p className="onboarding-eyebrow">NODUS FIT</p>
        <h1 id="onboarding-title">Complete seu perfil profissional</h1>
        <p>Esses dados liberam o cadastro de alunos e a operacao do personal.</p>

        <form onSubmit={submit}>
          <label>
            CPF
            <input
              required
              value={form.cpf}
              onChange={(event) => setForm({ ...form, cpf: event.target.value })}
              placeholder="123.456.789-00"
            />
          </label>
          <label>
            CREF
            <input
              required
              value={form.cref}
              onChange={(event) => setForm({ ...form, cref: event.target.value })}
              placeholder="123456-G/SP"
            />
          </label>
          <label>
            Telefone
            <input
              required
              value={form.telefone}
              onChange={(event) => setForm({ ...form, telefone: event.target.value })}
              placeholder="+5511999999999"
            />
          </label>
          <label>
            Especialidade
            <select
              value={form.especialidade}
              onChange={(event) =>
                setForm({ ...form, especialidade: event.target.value })
              }
            >
              {specialties.map((specialty) => (
                <option key={specialty}>{specialty}</option>
              ))}
            </select>
          </label>

          {error ? <p role="alert">{error}</p> : null}
          <button disabled={pending} type="submit">
            {pending ? "Salvando..." : "Salvar perfil"}
          </button>
        </form>
      </section>
    </main>
  );
}
