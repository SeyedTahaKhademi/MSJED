import PageHeader from "../components/PageHeader";
import OnboardingModal from "../components/OnboardingModal";
import { getCurrentUser, logout, registerUser, loginUser, setActiveMosque } from "../lib/auth";
import { readJSON, writeJSON } from "../lib/json";
import fs from "fs/promises";
import path from "path";

type Mosque = { id: string; name: string; address?: string; logo?: string; admins?: string[]; members?: string[] };
const MOSQUES_PATH = "data/mosques.json";

export default async function ProfilePage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const message = typeof searchParams.message === "string" ? searchParams.message : Array.isArray(searchParams.message) ? searchParams.message[0] : undefined;
  const me = await getCurrentUser();
  const mosques = await readJSON<Mosque[]>(MOSQUES_PATH, []);
  const myMosques = me ? mosques.filter((m) => (m.members||[]).includes(me.id)) : [];

  const createMosque = async (formData: FormData) => {
    "use server";
    const me = await getCurrentUser();
    if (!me) return;
    if (me.role !== "admin") return;
    const name = String(formData.get("name")||"").trim();
    const address = String(formData.get("address")||"").trim();
    if (!name) return;
    const id = Math.random().toString(36).slice(2,10);
    const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);

    let logoPath = "";
    const file = formData.get("logoFile") as File | null;
    if (file && typeof file === "object" && "arrayBuffer" in file && (file as any).size > 0) {
      const ab = await file.arrayBuffer();
      const buf = Buffer.from(ab);
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "mosques", id);
      await fs.mkdir(uploadsDir, { recursive: true });
      const ext = path.extname((file as any).name || "").toLowerCase() || ".jpg";
      const filename = `logo-${Date.now()}${ext}`;
      const dest = path.join(uploadsDir, filename);
      await fs.writeFile(dest, buf);
      logoPath = `/uploads/mosques/${id}/${filename}`;
    }

    list.unshift({ id, name, address, logo: logoPath, admins: [me.id], members: [me.id] });
    await writeJSON(MOSQUES_PATH, list);
    await setActiveMosque(id);
  };

  const doLogin = async (formData: FormData) => {
    "use server";
    await loginUser(formData);
  };

  const doRegister = async (formData: FormData) => {
    "use server";
    await registerUser(formData);
  };

  const activate = async (id: string) => {
    "use server";
    await setActiveMosque(id);
  };

  return (
    <main className="mx-auto max-w-3xl pb-24">
      <PageHeader title="صفحه کاربری" />
      <section className="px-4 py-6 space-y-6">
        {message && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3">
            <p className="text-sm text-green-700">{message}</p>
          </div>
        )}
        {message && <OnboardingModal showInitially />}
        {!me ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Register */}
            <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold text-neutral-900">ثبت‌نام</h2>
              <form action={doRegister} className="mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-xs text-neutral-700">
                    <input type="radio" name="role" value="admin" defaultChecked className="accent-[color:var(--secondary)]" /> مدیر مسجد
                  </label>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-xs text-neutral-700">
                    <input type="radio" name="role" value="member" className="accent-[color:var(--secondary)]" /> کاربر عادی
                  </label>
                </div>
                <input name="name" required placeholder="نام و نام‌خانوادگی" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)]" />
                <input name="phone" required inputMode="numeric" placeholder="شماره تلفن" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)]" />
                <input name="password" required type="password" placeholder="رمز عبور" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)]" />
                <button className="w-full rounded-lg bg-[color:var(--secondary)] px-4 py-2 text-sm font-medium text-white">ثبت‌نام</button>
              </form>
            </div>
            {/* Login */}
            <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold text-neutral-900">ورود</h2>
              <form action={doLogin} className="mt-3 space-y-2">
                <input name="phone" required inputMode="numeric" placeholder="شماره تلفن" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)]" />
                <input name="password" required type="password" placeholder="رمز عبور" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)]" />
                <button className="w-full rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white">ورود</button>
              </form>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">سلام، {me.name}</h2>
                <p className="text-xs text-neutral-500">شناسه: {me.id}</p>
              </div>
              <form action={logout}>
                <button className="rounded-lg border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5">خروج</button>
              </form>
            </div>
          </div>
        )}

        {me && me.role === "admin" ? (
          <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-neutral-900">ساخت مسجد جدید</h2>
            <form
              action={createMosque}
              className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3"
            >
              <input
                name="name"
                required
                placeholder="نام مسجد"
                className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)] sm:col-span-1"
              />
              <input
                name="address"
                placeholder="آدرس"
                className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)] sm:col-span-1"
              />
              <input
                name="logoFile"
                type="file"
                accept="image/*"
                className="rounded-lg border border-black/10 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-black/5 file:px-3 file:py-1.5 file:text-xs sm:col-span-1"
              />
              <button className="rounded-lg bg-[color:var(--secondary)] px-4 py-2 text-sm font-medium text-white sm:col-span-3">
                ایجاد مسجد
              </button>
            </form>
          </div>
        ) : me ? (
          <div className="rounded-2xl border border-black/5 bg-white p-4 text-sm text-neutral-700 shadow-sm">
            برای ساخت مسجد، با نقش «مدیر مسجد» ثبت‌نام کنید.
          </div>
        ) : null}

        {me ? (
          <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-neutral-900">مساجد من</h2>
            {myMosques.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-600">عضو مسجدی نیستید.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {myMosques.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-2 rounded-lg border border-black/5 bg-white px-3 py-2">
                    <a href={`/mosques/${m.id}`} className="text-sm font-medium hover:text-[color:var(--secondary)]">{m.name}</a>
                    <div className="flex items-center gap-2">
                      <form action={activate.bind(null, m.id)}>
                        <button className="rounded-lg border border-black/10 px-2 py-1 text-xs hover:bg-black/5">انتخاب</button>
                      </form>
                      {(m.admins||[]).includes(me.id) ? (
                        <a href={`/mosques/${m.id}/admin`} className="text-xs text-[color:var(--secondary)]">پنل ادمین</a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}
