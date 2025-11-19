import fs from "fs/promises";
import path from "path";
import PageHeader from "../components/PageHeader";

export default async function FaqPage() {
  const file = path.join(process.cwd(), "data", "faq.json");
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
