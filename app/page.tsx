export default function Home() {
  return (
    <main className="mx-auto max-w-3xl pb-24">
      <header className="sticky top-0 z-40 mx-auto w-full max-w-3xl border-b border-black/5 bg-white/70 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/50">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-neutral-900">خانه</h1>
        </div>
      </header>
      {/* Hero */}
      <section className="px-4 pt-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[color:var(--accent)] to-[color:var(--secondary)] p-6 text-white shadow-sm">
          <h2 className="text-lg font-bold">رویدادهای پیش‌رو</h2>
          <p className="mt-2 max-w-prose text-sm/6 opacity-90">
            تازه‌ترین اعلانات و برنامه‌های فرهنگی مسجد را اینجا دنبال کنید.
          </p>
          <div className="mt-4">
            <a href="/announcements" className="inline-flex items-center justify-center rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-neutral-900 shadow hover:bg-white">
              مشاهده اعلانات
            </a>
          </div>
          <div className="pointer-events-none absolute -bottom-10 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-white/20 blur-2xl" />
        </div>
      </section>

      {/* Search */}
      <section className="px-4 pt-4">
        <div className="rounded-2xl border border-black/5 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" className="text-neutral-400" fill="none"><path d="m21 21-4.3-4.3M18 11.5A6.5 6.5 0 1 1 5 5a6.5 6.5 0 0 1 13 6.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            <input placeholder="جستجو..." className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400" />
            <button className="rounded-lg bg-[color:var(--secondary)] px-3 py-1.5 text-xs font-medium text-white">جستجو</button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-neutral-900">بخش‌ها</h3>
          <span className="h-4 w-1.5 rounded bg-[color:var(--secondary)]" />
        </div>
        <div className="space-y-3">
          <a href="/culture" className="block rounded-2xl bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--secondary)]/10 text-[color:var(--secondary)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h12a2 2 0 0 1 2 2v12l-4-3-4 3-4-3-4 3V6a2 2 0 0 1 2-2Z"/></svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">برنامه فرهنگی</p>
                <p className="text-xs text-neutral-500">زمان‌بندی سخنرانی و کلاس‌ها</p>
              </div>
            </div>
          </a>
          <a href="/magazine" className="block rounded-2xl bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--secondary)]/10 text-[color:var(--secondary)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h9a3 3 0 0 1 3 3v15l-3-2-3 2-3-2-3 2V6a3 3 0 0 1 3-3Z"/></svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">مجله مسجد</p>
                <p className="text-xs text-neutral-500">نشریات و ویژه‌نامه‌ها</p>
              </div>
            </div>
          </a>
          <a href="/faq" className="block rounded-2xl bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--secondary)]/10 text-[color:var(--secondary)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 1 0 9 9A9 9 0 0 0 12 3Zm0 13a1.25 1.25 0 1 1 1.25-1.25A1.25 1.25 0 0 1 12 16Zm1.82-6.39c-.5.45-.82.75-.82 1.39v.5h-2v-.5a3.27 3.27 0 0 1 1.16-2.55c.52-.46.84-.76.84-1.45A1.62 1.62 0 0 0 9.6 5.88a1.77 1.77 0 0 0-1.73 1.37l-1.94-.5A3.78 3.78 0 0 1 9.53 4a3.59 3.59 0 0 1 3.77 3.58 3 3 0 0 1-1.48 2.03Z"/></svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">سوالات شرعی</p>
                <p className="text-xs text-neutral-500">پرسش از روحانی</p>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* Quick icon cards (3-column grid) */}
      <section className="px-4 pt-6">
        <div className="grid grid-cols-3 gap-3">
          <a href="/announcements" className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 text-center shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--secondary)]/10 text-[color:var(--secondary)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10h16v4H4z"/></svg>
            </span>
            <span className="text-xs font-medium text-neutral-900">اعلانات</span>
          </a>
          <a href="/culture" className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 text-center shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--secondary)]/10 text-[color:var(--secondary)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h12v2H6zm0 5h12v2H6zm0 5h12v2H6z"/></svg>
            </span>
            <span className="text-xs font-medium text-neutral-900">برنامه‌ها</span>
          </a>
          <a href="/magazine" className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 text-center shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--secondary)]/10 text-[color:var(--secondary)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h9a3 3 0 0 1 3 3v15l-3-2-3 2-3-2-3 2V6a3 3 0 0 1 3-3Z"/></svg>
            </span>
            <span className="text-xs font-medium text-neutral-900">مجله</span>
          </a>
          <a href="/faq" className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 text-center shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--secondary)]/10 text-[color:var(--secondary)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 1 0 9 9A9 9 0 0 0 12 3Zm0 13a1.25 1.25 0 1 1 1.25-1.25A1.25 1.25 0 0 1 12 16Z"/></svg>
            </span>
            <span className="text-xs font-medium text-neutral-900">سوالات</span>
          </a>
          <a href="/reports" className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 text-center shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--secondary)]/10 text-[color:var(--secondary)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h6v16H4zm10 6h6v10h-6zM14 4h6v4h-6z"/></svg>
            </span>
            <span className="text-xs font-medium text-neutral-900">گزارشات</span>
          </a>
          <a href="/about" className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 text-center shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--secondary)]/10 text-[color:var(--secondary)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm-7 8a7 7 0 1 1 14 0Z"/></svg>
            </span>
            <span className="text-xs font-medium text-neutral-900">درباره</span>
          </a>
        </div>
      </section>

    </main>
  );
}
