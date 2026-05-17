import Link from "next/link";
import { PublicBrand } from "./public-brand";

const footerLinks = [
  { href: "/privacidade", label: "Privacidade" },
  { href: "/termos", label: "Termos" },
  { href: "/contato", label: "Contato" },
];

export function PublicFooter() {
  return (
    <footer className="border-border-muted border-t bg-[#0A0F0D] px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <PublicBrand />
          <p className="max-w-md text-sm font-medium text-ink-tertiary">
            Plataforma web e PWA para personal trainers gerenciarem alunos, treinos,
            evolucao e financeiro em uma experiencia direta.
          </p>
        </div>
        <nav
          aria-label="Links institucionais"
          className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-ink-secondary"
        >
          {footerLinks.map((link) => (
            <Link
              className="transition hover:text-brand-400"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
