"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

 type SearchResult = { type: string; title: string; snippet?: string; link: string; mosqueId: string; mosqueName: string };

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, { signal: ctrl.signal });
        if (!res.ok) return;
        const data = await res.json();
        setResults(Array.isArray(data.results) ? data.results : []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => {
      ctrl.abort();
      clearTimeout(id);
    };
  }, [q]);

  return (
    <section className="px-4 pt-4">
      <div className="rounded-2xl border border-black/5 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" className="text-neutral-400" fill="none">
            <path
              d="m21 21-4.3-4.3M18 11.5A6.5 6.5 0 1 1 5 5a6.5 6.5 0 0 1 13 6.5Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجوی سراسری..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>
      {(q || loading || results.length > 0) && (
        <div className="mt-3 rounded-2xl border border-black/5 bg-white p-3 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-900">
            {q ? `نتایج «${q}»` : "نتایج"}
          </h3>
          {loading ? (
            <p className="mt-2 text-xs text-neutral-600">در حال جستجو...</p>
          ) : results.length === 0 ? (
            <p className="mt-2 text-xs text-neutral-600">چیزی پیدا نشد.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {results.slice(0, 30).map((r, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-black/5 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {r.title}{" "}
                      <span className="text-[10px] text-neutral-500">
                        ({r.type} • {r.mosqueName})
                      </span>
                    </p>
                    {r.snippet ? (
                      <p className="text-xs text-neutral-600">{r.snippet}</p>
                    ) : null}
                  </div>
                  <Link href={r.link} className="text-xs text-[color:var(--secondary)]">
                    مشاهده
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
