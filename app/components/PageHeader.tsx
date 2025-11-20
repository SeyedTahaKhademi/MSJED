"use client";
import { useRouter } from "next/navigation";

type Props = { title: string };

export default function PageHeader({ title }: Props) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-40 mx-auto w-full max-w-3xl border-b border-black/5 bg-white/70 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="بازگشت"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-black/5 hover:text-[color:var(--secondary)]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-neutral-900">{title}</h1>
        </div>
        <button
          onClick={() => window.dispatchEvent(new Event("open-help-modal"))}
          aria-label="راهنما"
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-black/5 hover:text-[color:var(--secondary)]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.1 9a3 3 0 1 1 4.9 2.4c-.9.6-1.5 1.1-1.5 2.1V14"/>
            <circle cx="12" cy="18" r="1"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
