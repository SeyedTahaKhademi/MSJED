import PageHeader from "../components/PageHeader";
import { readJSON, writeJSON } from "../lib/json";
import { getCurrentUser, setActiveMosque } from "../lib/auth";

export const dynamic = "force-dynamic";

type Mosque = { id: string; name: string; address?: string; logo?: string; admins?: string[]; members?: string[] };
const MOSQUES_PATH = "data/mosques.json";

function uid() { return Math.random().toString(36).slice(2, 10); }

export default async function MosquesPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams?.q || "").toLowerCase();
  const me = await getCurrentUser();
  const mosques = await readJSON<Mosque[]>(MOSQUES_PATH, []);
  const filtered = mosques.filter((m) => !q || m.name.toLowerCase().includes(q) || (m.address||"").toLowerCase().includes(q));

  const join = async (formData: FormData) => {
    "use server";
    const id = String(formData.get("id") || "");
    const me = await getCurrentUser();
    if (!me) return;
    const mosques = await readJSON<Mosque[]>(MOSQUES_PATH, []);
    const m = mosques.find((x) => x.id === id);
    if (!m) return;
    m.members = Array.from(new Set([...(m.members||[]), me.id]));
    await writeJSON(MOSQUES_PATH, mosques);
    // also mark active mosque
    await setActiveMosque(id);
    // update user.mosques
    const users = await readJSON<any[]>("data/users.json", []);
    const u = users.find((x) => x.id === me.id);
    if (u) { u.mosques = Array.from(new Set([...(u.mosques||[]), id])); await writeJSON("data/users.json", users); }
  };

  return (
    <main className="mx-auto max-w-3xl pb-24">
      <PageHeader title="مساجد" />
      <section className="px-4 py-4">
        <form className="mb-4">
          <input name="q" defaultValue={searchParams?.q||""} placeholder="جستجوی مسجد..." className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)]" />
        </form>
        <ul className="space-y-3">
          {filtered.map((m) => (
            <li key={m.id} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[color:var(--secondary)]/10">
                  {m.logo ? <img src={m.logo} alt="لوگو" className="h-10 w-10 object-cover"/> : (
                    <span className="text-sm font-medium text-[color:var(--secondary)]">مسجد</span>
                  )}
                </div>
                <div className="flex-1">
                  <a href={`/mosques/${m.id}`} className="text-sm font-medium text-neutral-900 hover:text-[color:var(--secondary)]">{m.name}</a>
                  {m.address ? <p className="text-xs text-neutral-500">{m.address}</p> : null}
                </div>
                {me ? (
                  <form action={join}>
                    <input type="hidden" name="id" value={m.id} />
                    <button className="rounded-lg border border-[color:var(--secondary)] px-3 py-1 text-xs text-[color:var(--secondary)] hover:bg-[color:var(--secondary)]/10">عضویت</button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
          {filtered.length === 0 ? <p className="text-neutral-600">نتیجه‌ای یافت نشد.</p> : null}
        </ul>
      </section>
    </main>
  );
}
