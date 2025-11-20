import fs from "fs/promises";
import PageHeader from "../components/PageHeader";
import Link from "next/link";
import { getActiveMosqueId, getCurrentUser } from "../lib/auth";
import { ensureMosqueData, mosqueDataPath } from "../lib/mosque";
import { readJSON } from "../lib/json";

export const dynamic = "force-dynamic";

type Mosque = { id: string; members?: string[] };

export default async function FaqPage() {
  const active = await getActiveMosqueId();
  if (!active) {
    return (
      <main className="mx-auto max-w-3xl pb-24">
        <PageHeader title="سوالات شرعی" />
        <section className="px-4 py-6">
          <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <p className="text-sm text-neutral-700">برای مشاهده سوالات، ابتدا ثبت‌نام/ورود کنید و مسجد خود را انتخاب کنید.</p>
            <div className="mt-3 flex gap-2">
              <Link href="/profile" className="rounded-lg bg-[color:var(--secondary)] px-3 py-1.5 text-xs font-medium text-white">ثبت‌نام / ورود</Link>
              <Link href="/mosques" className="rounded-lg border border-[color:var(--secondary)] px-3 py-1.5 text-xs text-[color:var(--secondary)]">جست‌وجوی مسجد</Link>
            </div>
          </div>
        </section>
      </main>
    );
  }
  const me = await getCurrentUser();
  const mosques = await readJSON<Mosque[]>("data/mosques.json", []);
  const m = mosques.find((x) => x.id === active);
  const isMember = me && m ? (m.members || []).includes(me.id) : false;
  if (!isMember) {
    return (
      <main className="mx-auto max-w-3xl pb-24">
        <PageHeader title="سوالات شرعی" />
        <section className="px-4 py-6">
          <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <p className="text-sm text-neutral-700">شما عضو مسجد انتخاب‌شده نیستید. ابتدا عضو شوید.</p>
            <div className="mt-3">
              <Link href="/mosques" className="rounded-lg bg-[color:var(--secondary)] px-3 py-1.5 text-xs font-medium text-white">رفتن به مساجد</Link>
            </div>
          </div>
        </section>
      </main>
    );
  }
  await ensureMosqueData(active);
  const file = await mosqueDataPath(active, "faq.json");
  const raw = await fs.readFile(file, "utf-8").catch(() => "[]");
  const items: Array<{ id: string; question: string; answer?: string }> = JSON.parse(raw || "[]");
  return (
    <main className="mx-auto max-w-3xl pb-24">
      <PageHeader title="سوالات شرعی" />
      <section className="px-4 py-4">
        {items.length === 0 ? <p className="text-neutral-600">سوالی ثبت نشده است.</p> : (
          <ul className="space-y-3">
            {items.map((it) => (
              <li key={it.id} className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-neutral-900">س: {it.question}</p>
                {it.answer ? <p className="mt-1 text-sm text-neutral-700">ج: {it.answer}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
