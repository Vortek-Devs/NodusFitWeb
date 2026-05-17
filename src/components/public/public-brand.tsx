import Link from "next/link";

export function PublicBrand() {
  return (
    <Link className="flex items-center gap-3" href="/" aria-label="Nodus Fit">
      <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-sm font-extrabold text-on-brand shadow-brand">
        NF
      </span>
      <span className="text-lg font-extrabold tracking-normal text-brand-50">
        NODUS <span className="text-brand-400">FIT</span>
      </span>
    </Link>
  );
}
