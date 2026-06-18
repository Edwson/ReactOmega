import Link from "next/link";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#06060a]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          React<span className="text-violet-400">Ω</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-neutral-400">
          <Link href="/components" className="transition-colors hover:text-white">
            Components
          </Link>
          <a
            href="https://github.com/Edwson/ReactOmega"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-white"
          >
            GitHub ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
