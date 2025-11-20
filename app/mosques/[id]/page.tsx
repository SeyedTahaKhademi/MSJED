import { readJSON, writeJSON } from "../../lib/json";
import { getCurrentUser, setActiveMosque, clearActiveMosque } from "../../lib/auth";
import PageHeader from "../../components/PageHeader";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Mosque = { id: string; name: string; address?: string; logo?: string; admins?: string[]; members?: string[] };
const MOSQUES_PATH = "data/mosques.json";

// Module-scope server actions to avoid inline action edge cases
async function joinAction(id: string) {
  "use server";
  const me = await getCurrentUser();
  if (!me) {
    redirect(`/profile?message=${encodeURIComponent("ابتدا وارد شوید")}`);
  }
  const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
  const m = list.find((x) => x.id === id);
  if (!m) {
    redirect(`/explore?message=${encodeURIComponent("مسجد یافت نشد")}`);
  }
  m.members = Array.from(new Set([...(m.members || []), me.id]));
  await writeJSON(MOSQUES_PATH, list);
  await setActiveMosque(id);
  redirect(`/mosques/${id}?message=${encodeURIComponent("عضویت موفق")}`);
}

async function leaveAction(id: string) {
  "use server";
  const me = await getCurrentUser();
  if (!me) {
    redirect(`/profile?message=${encodeURIComponent("ابتدا وارد شوید")}`);
  }
  const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
  const m = list.find((x) => x.id === id);
  if (!m) {
    redirect(`/mosques/${id}?message=${encodeURIComponent("مسجد یافت نشد")}`);
  }
  m.members = (m.members || []).filter((x) => x !== me.id);
  await writeJSON(MOSQUES_PATH, list);
  await clearActiveMosque();
  redirect("/profile?message=خروج موفق");
}

export default async function MosqueDetail({ params, searchParams }: { params: { id: string }; searchParams?: { message?: string } }) {
  const { id } = params;
  const me = await getCurrentUser();
  const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
  const mosque = list.find((m) => m.id === id);

  const join = joinAction.bind(null, id);

  const leave = leaveAction.bind(null, id);

  if (!mosque) {
    redirect(`/explore?message=${encodeURIComponent("مسجد یافت نشد")}`);
  }

  const isMember = me ? (mosque.members||[]).includes(me.id) : false;
  const isAdmin = me ? (mosque.admins || []).includes(me.id) : false;
  const memberCount = (mosque.members || []).length;

  return (
    <main className="mx-auto max-w-3xl pb-24">
      <PageHeader title={mosque.name || "مسجد"} />
      {searchParams?.message ? (
        <div className="px-4 pt-4">
          <div className="rounded-xl border border-[color:var(--secondary)]/30 bg-[color:var(--secondary)]/10 px-4 py-3 text-sm text-[color:var(--secondary)]">
            {searchParams.message}
          </div>
        </div>
      ) : null}
      <section className="px-4 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[color:var(--secondary)]/10">
            {mosque.logo ? (
              <img src={mosque.logo} alt="لوگو" className="h-14 w-14 object-cover"/>
            ) : (
              <img src="/logo/photo22144107936.jpg" alt="لوگوی مسجد ما" className="h-12 w-12 object-contain opacity-90" />
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
