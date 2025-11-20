"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto mb-safe w-full max-w-3xl px-4 pb-3">
      <div className="mx-auto grid grid-cols-4 items-center rounded-2xl border border-black/5 bg-white/70 px-6 py-2.5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/50">
        {/* Profile */}
        <Link href="/profile" aria-current={isActive("/profile") ? "page" : undefined} className="group col-start-1 flex items-center justify-center text-neutral-700 hover:text-[color:var(--secondary)]">
          <span className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isActive("/profile") ? "bg-[color:var(--secondary)]/10 text-[color:var(--secondary)]" : ""}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="transition-colors">
              <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
              <path d="M4 20a8 8 0 0 1 16 0" />
            </svg>
          </span>
        </Link>
        {/* Explore */}
        <Link href="/explore" aria-current={isActive("/explore") ? "page" : undefined} className="group col-start-2 flex items-center justify-center text-neutral-700 hover:text-[color:var(--secondary)]">
          <span className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isActive("/explore") ? "bg-[color:var(--secondary)]/10 text-[color:var(--secondary)]" : ""}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" className="transition-colors" fill="none"><path d="m21 21-4.3-4.3M18 11.5A6.5 6.5 0 1 1 5 5a6.5 6.5 0 0 1 13 6.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </span>
        </Link>
        {/* Home (highlight) */}
        <Link href="/" aria-current={isActive("/") ? "page" : undefined} className="group col-start-3 flex items-center justify-center">
          <span className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-colors ${isActive("/") ? "bg-neutral-900 text-white" : "bg-black/5 text-neutral-700 group-hover:text-[color:var(--secondary)]"}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="transition-colors">
              <path d="M3 11.5 12 3l9 8.5"/>
              <path d="M5 10.5V21h14v-10.5"/>
            </svg>
          </span>
        </Link>
        {/* Settings */}
        <Link href="/settings" aria-current={isActive("/settings") ? "page" : undefined} className="group col-start-4 flex items-center justify-center text-neutral-700 hover:text-[color:var(--secondary)]">
          <span className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isActive("/settings") ? "bg-[color:var(--secondary)]/10 text-[color:var(--secondary)]" : ""}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="transition-colors">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3.6 15a1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 3.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 6.04 3.3l.06.06A1.65 1.65 0 0 0 7.92 3a1.65 1.65 0 0 0 1-1.51V1a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 3.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 21 8.08c0 .6.24 1.17.66 1.6l.09.09a2 2 0 1 1-2.83 2.83l-.09-.09A1.65 1.65 0 0 0 19.4 15Z"/>
            </svg>
          </span>
        </Link>
      </div>
    </nav>
  );
}
