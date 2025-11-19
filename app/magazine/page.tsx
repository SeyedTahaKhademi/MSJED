import fs from "fs/promises";
import path from "path";
import PageHeader from "../components/PageHeader";

export default async function MagazinePage() {
  const file = path.join(process.cwd(), "data", "magazine.json");
  const raw = await fs.readFile(file, "utf-8").catch(() => "[]");
  const items: Array<{ id: string; title: string; link?: string }> = JSON.parse(raw || "[]");
  return (
    <main className="mx-auto max-w-3xl pb-24">
      <PageHeader title="مجله مسجد" />
      <section className="px-4 py-4">
        {items.length === 0 ? <p className="text-neutral-600">شماره‌ای موجود نیست.</p> : (
          <ul className="space-y-3">
            {items.map((it) => (
              <li key={it.id} className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-neutral-900">{it.title}</h3>
                  {it.link ? <a className="text-sm text-[color:var(--accent)]" href={it.link} target="_blank">دانلود</a> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
