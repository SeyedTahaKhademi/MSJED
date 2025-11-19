"use client";
import { useRouter } from "next/navigation";

type Props = { title: string };

export default function PageHeader({ title }: Props) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-40 mx-auto w-full max-w-3xl border-b border-black/5 bg-white/70 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          aria-label="برگشت"
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-black/5 hover:text-[color:var(--accent)]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 19 8 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-neutral-900">{title}</h1>
      </div>
    </header>
  );
}
