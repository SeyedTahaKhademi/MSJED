"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuccessAddingPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.push("/");
    }, 2000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <main className="mx-auto max-w-3xl pb-24">
      <section className="px-4 py-10">
        <div className="rounded-2xl border border-black/5 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-neutral-900">با موفقیت عضو شدید</h1>
          <p className="mt-2 text-sm text-neutral-600">تا چند لحظه دیگر به صفحه اصلی منتقل میشوید...</p>
        </div>
      </section>
    </main>
  );
}
