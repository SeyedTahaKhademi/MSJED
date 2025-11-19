import fs from "fs/promises";
import path from "path";
import PageHeader from "../components/PageHeader";

export default async function CulturePage() {
  const file = path.join(process.cwd(), "data", "culture.json");
  const raw = await fs.readFile(file, "utf-8").catch(() => "[]");
  const items: Array<{ id: string; title: string; time?: string; description?: string }> = JSON.parse(raw || "[]");
  return (
    <main className="mx-auto max-w-3xl pb-24">
      <PageHeader title="برنامه فرهنگی" />
      <section className="px-4 py-4">
        {items.length === 0 ? <p className="text-neutral-600">برنامه‌ای ثبت نشده است.</p> : (
          <ul className="space-y-3">
            {items.map((it) => (
              <li key={it.id} className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
                <h3 className="text-base font-semibold text-neutral-900">{it.title}</h3>
                {it.description ? <p className="mt-1 text-sm text-neutral-700">{it.description}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
