import { readJSON, writeJSON } from "../../lib/json";
import { getCurrentUser, setActiveMosque } from "../../lib/auth";
import PageHeader from "../../components/PageHeader";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Mosque = { id: string; name: string; address?: string; logo?: string; admins?: string[]; members?: string[] };
const MOSQUES_PATH = "data/mosques.json";

export default async function MosqueDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await getCurrentUser();
  const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
  const mosque = list.find((m) => m.id === id);

  const join = async () => {
    "use server";
    const me = await getCurrentUser();
    if (!me) return;
    const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
    const m = list.find((x) => x.id === id);
    if (!m) return;
    m.members = Array.from(new Set([...(m.members||[]), me.id]));
    await writeJSON(MOSQUES_PATH, list);
    await setActiveMosque(id);
    return redirect("/profile?message=عضویت موفق");
  };

  const leave = async () => {
    "use server";
    const me = await getCurrentUser();
    if (!me) return;
    const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
    const m = list.find((x) => x.id === id);
    if (!m) return;
    m.members = (m.members||[]).filter((x) => x !== me.id);
    await writeJSON(MOSQUES_PATH, list);
    return redirect("/profile?message=خروج موفق");
  };

  if (!mosque) {
    return (
      <main className="mx-auto max-w-3xl pb-24">
        <PageHeader title="مسجد" />
        <section className="px-4 py-6">
          <p className="text-neutral-600">مسجدی یافت نشد.</p>
        </section>
      </main>
    );
  }

  const isMember = me ? (mosque.members||[]).includes(me.id) : false;
  const isAdmin = me ? (mosque.admins || []).includes(me.id) : false;
  const memberCount = (mosque.members || []).length;

  return (
    <main className="mx-auto max-w-3xl pb-24">
      <PageHeader title={mosque.name || "مسجد"} />
      <section className="px-4 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[color:var(--secondary)]/10">
            {mosque.logo ? <img src={mosque.logo} alt="لوگو" className="h-14 w-14 object-cover"/> : (
              <span className="text-sm font-medium text-[color:var(--secondary)]">مسجد</span>
            )}
          </div>
          <div>
            <h2 className="text-base font-semibold text-neutral-900">{mosque.name}</h2>
            {mosque.address ? <p className="text-xs text-neutral-500">{mosque.address}</p> : null}
            <p className="text-xs text-neutral-500 mt-1">{memberCount} عضو</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isMember ? (
            <form action={join}>
              <button className="rounded-lg bg-[color:var(--secondary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">عضویت در این مسجد</button>
            </form>
          ) : (
            <>
              <form action={leave}>
                <button className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50">خروج از مسجد</button>
              </form>
              <a href="/announcements" className="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-black/5">مشاهده اعلانات</a>
              {isAdmin && (
                <a href={`/mosques/${id}/admin`} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90">پنل ادمین</a>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
