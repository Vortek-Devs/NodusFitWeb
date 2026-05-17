import Link from "next/link";
import { PublicBrand } from "./public-brand";

const navigationLinks = [
  { href: "/#produto", label: "Produto" },
  { href: "/#fluxo", label: "Como funciona" },
  { href: "/#precos", label: "Precos" },
];

export function PublicHeader() {
  return (
    <header className="relative z-20 border-border-muted/60 border-b bg-[#0A0F0D]/88 backdrop-blur">
      <div className="mx-auto flex min-h-nav w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <PublicBrand />
        <nav
          aria-label="Navegacao principal"
          className="hidden items-center gap-7 text-sm font-semibold text-ink-tertiary md:flex"
        >
          {navigationLinks.map((link) => (
            <Link
              className="transition hover:text-brand-400"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          className="hidden min-h-10 items-center justify-center rounded-pill border border-brand-400/35 px-4 text-sm font-bold text-brand-400 transition hover:bg-brand-400 hover:text-on-brand sm:inline-flex"
          href="/#precos"
        >
          Comecar
        </Link>
      </div>
    </header>
  );
}
