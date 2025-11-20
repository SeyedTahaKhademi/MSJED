"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function OnboardingModal({ showInitially = false }: { showInitially?: boolean }) {
  const [open, setOpen] = useState(showInitially);
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-help-modal", handler);
    return () => window.removeEventListener("open-help-modal", handler);
  }, []);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="text-base font-semibold text-neutral-900">راهنمای استفاده</h3>
        <p className="mt-2 text-sm text-neutral-700">
          برای مشاهده محتوای مخصوص مسجد خود، ابتدا ثبت‌نام کنید و مسجدتان را جست‌وجو و انتخاب کنید. اگر مدیر مسجد هستید، با نقش مدیر ثبت‌نام کنید و اطلاعات مسجد (نام، آدرس، آواتار) را ثبت کنید.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/profile" className="rounded-lg bg-[color:var(--secondary)] px-4 py-2 text-sm font-medium text-white">ثبت‌نام / ورود</Link>
          <Link href="/mosques" className="rounded-lg border border-[color:var(--secondary)] px-4 py-2 text-sm text-[color:var(--secondary)]">جست‌وجوی مسجد</Link>
          <button onClick={() => setOpen(false)} className="rounded-lg border border-black/10 px-4 py-2 text-sm">متوجه شدم</button>
        </div>
      </div>
    </div>
  );
}
