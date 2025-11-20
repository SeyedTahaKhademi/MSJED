import fs from "fs/promises";
import path from "path";
import PageHeader from "../components/PageHeader";

async function readJSON<T>(name: string, fallback: T): Promise<T> {
  const p = path.join(process.cwd(), "data", name + ".json");
  try { const raw = await fs.readFile(p, "utf-8"); return JSON.parse(raw) as T; } catch { return fallback; }
}

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const announcements = await readJSON<Array<{id:string; title:string;}>>("announcements", []);
  return (
    <main className="mx-auto max-w-3xl pb-24">
      <PageHeader title="داشبورد ادمین" />
      <section className="px-4 py-4 space-y-6">
        <div className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-900">اعلانات</h2>
          <p className="mt-1 text-sm text-neutral-600">تعداد: {announcements.length}</p>
          <AddAnnouncement />
          <AnnouncementsList initialItems={announcements} />
        </div>
      </section>
    </main>
  );
}

async function writeAnnouncements(items: Array<{id:string; title:string; date?:string; description?:string;}>) {
  "use server";
  const file = path.join(process.cwd(), "data", "announcements.json");
  await fs.writeFile(file, JSON.stringify(items, null, 2), "utf-8");
}

function uid() { return Math.random().toString(36).slice(2, 10); }

function AddAnnouncement() {
  const add = async (formData: FormData) => {
    "use server";
    const file = path.join(process.cwd(), "data", "announcements.json");
    const raw = await fs.readFile(file, "utf-8").catch(() => "[]");
    const items = JSON.parse(raw || "[]") as Array<Record<string, unknown>>;
    items.unshift({ id: uid(), title: String(formData.get("title")||""), date: String(formData.get("date")||""), description: String(formData.get("description")||"") } as Record<string, unknown>);
    await fs.writeFile(file, JSON.stringify(items, null, 2), "utf-8");
  };
  return (
    <form action={add} className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-4">
      <input name="title" required placeholder="عنوان" className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--accent)] sm:col-span-1" />
      <input name="date" type="date" className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--accent)] sm:col-span-1" />
      <input name="description" placeholder="توضیحات" className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--accent)] sm:col-span-2" />
      <button className="rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-white">افزودن</button>
    </form>
  );
}

function AnnouncementsList({ initialItems }: { initialItems: Array<{id:string; title:string; date?:string; description?:string;}> }) {
  const remove = async (id: string) => {
    "use server";
    const file = path.join(process.cwd(), "data", "announcements.json");
    const raw = await fs.readFile(file, "utf-8").catch(() => "[]");
    const items = JSON.parse(raw || "[]") as Array<Record<string, unknown>>;
    const next = items.filter((x) => String(x.id ?? "") !== id);
    await fs.writeFile(file, JSON.stringify(next, null, 2), "utf-8");
  };

  return (
    <ul className="mt-4 divide-y divide-black/5">
      {initialItems.map((it) => (
        <li key={it.id} className="flex items-start justify-between py-3">
          <div>
            <p className="text-sm font-medium text-neutral-900">{it.title}</p>
            {it.description ? <p className="text-xs text-neutral-600">{it.description}</p> : null}
          </div>
          <form action={remove.bind(null, it.id)}>
            <button className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50">حذف</button>
          </form>
        </li>
      ))}
    </ul>
  );
}
