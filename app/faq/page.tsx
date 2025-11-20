import PageHeader from "../components/PageHeader";
import Link from "next/link";
import { getActiveMosqueId, getCurrentUser } from "../lib/auth";
import { ensureMosqueData, mosqueDataPath } from "../lib/mosque";
import { readJSON, writeJSON } from "../lib/json";

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
  const file = mosqueDataPath(active, "faq.json");
  const items = await readJSON<Array<{ id: string; question: string; answer?: string }>>(file, []);

  const askQuestion = async (formData: FormData) => {
    "use server";
    const activeMosque = await getActiveMosqueId();
    if (!activeMosque) return;
    const me = await getCurrentUser();
    if (!me) return;
    const mosques = await readJSON<Mosque[]>("data/mosques.json", []);
    const m = mosques.find((x) => x.id === activeMosque);
    const isMemberHere = me && m ? (m.members || []).includes(me.id) : false;
    if (!isMemberHere) return;
    const question = String(formData.get("question") || "").trim();
    if (!question) return;
    await ensureMosqueData(activeMosque);
    const p = mosqueDataPath(activeMosque, "faq.json");
    const current = await readJSON<Array<{ id: string; question: string; answer?: string }>>(p, []);
    const id = Math.random().toString(36).slice(2, 10);
    current.unshift({ id, question });
    await writeJSON(p, current);
  };

  const waitingCount = items.filter((it) => !it.answer).length;
  const answeredCount = items.filter((it) => !!it.answer).length;
  return (
    <main className="mx-auto max-w-3xl pb-24">
      <PageHeader title="سوالات شرعی" />
      <section className="px-4 py-4">
        <form action={askQuestion} className="mb-4 space-y-2 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-neutral-900">ثبت سوال جدید</p>
          <textarea
            name="question"
            required
            placeholder="سوال شرعی خود را بنویسید..."
            className="h-20 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)]"
          />
          <button className="w-full rounded-lg bg-[color:var(--secondary)] px-4 py-2 text-sm font-medium text-white">
            ارسال سوال
          </button>
        </form>
        {(waitingCount > 0 || answeredCount > 0) && (
          <div className="mb-4 rounded-2xl border border-[color:var(--secondary)]/20 bg-[color:var(--secondary)]/5 px-4 py-3 text-xs text-neutral-800">
            {waitingCount > 0 && (
              <p>شما {waitingCount} سؤال در انتظار پاسخ روحانی دارید.</p>
            )}
            {answeredCount > 0 && (
              <p className="mt-1">برای {answeredCount} سؤال پاسخ ثبت شده است. پایین همین صفحه ببینید.</p>
            )}
          </div>
        )}
        {items.length === 0 ? (
          <p className="text-neutral-600">سوالی ثبت نشده است.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((it) => (
              <li key={it.id} className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-neutral-900">س: {it.question}</p>
                {it.answer ? (
                  <p className="mt-1 text-sm text-neutral-700">ج: {it.answer}</p>
                ) : (
                  <p className="mt-1 text-xs text-neutral-500">در انتظار پاسخ روحانی...</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
