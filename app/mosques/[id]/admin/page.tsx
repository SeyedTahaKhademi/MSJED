import PageHeader from "../../../components/PageHeader";
import { getCurrentUser } from "../../../lib/auth";
import { readJSON, writeJSON } from "../../../lib/json";
import { ensureMosqueData, mosqueDataPath } from "../../../lib/mosque";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

type User = { id: string; name: string; phone?: string; role?: string };
type MemberRole = { userId: string; role: "admin" | "culture_admin" | "magazine_admin" | "member" };

export const dynamic = "force-dynamic";

type Mosque = {
  id: string;
  name: string;
  address?: string;
  logo?: string;
  admins?: string[];
  members?: string[];
  memberRoles?: MemberRole[];
};
const MOSQUES_PATH = "data/mosques.json";

export default async function MosqueAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await getCurrentUser();
  const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
  const mosque = list.find((m) => m.id === id);
  const isAdmin = !!(me && mosque && (mosque.admins || []).includes(me.id));
  const myRole = me && mosque ? (mosque.memberRoles || []).find((mr) => mr.userId === me.id)?.role : undefined;
  const canManageCulture = isAdmin || myRole === "culture_admin";
  const canManageMagazine = isAdmin || myRole === "magazine_admin";
  const hasAnyAccess = isAdmin || myRole === "culture_admin" || myRole === "magazine_admin";
  await ensureMosqueData(id);
  const annPath = await mosqueDataPath(id, "announcements.json");
  const annRaw = await fs.readFile(annPath, "utf-8").catch(() => "[]");
  const announcements: Array<{ id: string; title: string; date?: string; description?: string }> = JSON.parse(annRaw || "[]");
  // other content
  const culturePath = await mosqueDataPath(id, "culture.json");
  const magazinePath = await mosqueDataPath(id, "magazine.json");
  const faqPath = await mosqueDataPath(id, "faq.json");
  const reportsPath = await mosqueDataPath(id, "reports.json");
  const aboutPath = await mosqueDataPath(id, "about.json");
  const photosPath = await mosqueDataPath(id, "photos.json");
  const culture: Array<{ id: string; title: string; description?: string; time?: string; image?: string }> = JSON.parse(
    await fs.readFile(culturePath, "utf-8").catch(() => "[]") || "[]"
  );
  const magazines: Array<{ id: string; title: string; link?: string }> = JSON.parse(await fs.readFile(magazinePath, "utf-8").catch(() => "[]") || "[]");
  const faqs: Array<{ id: string; question: string; answer?: string }> = JSON.parse(await fs.readFile(faqPath, "utf-8").catch(() => "[]") || "[]");
  const reports: Array<{ id: string; title: string; description?: string; date?: string }> = JSON.parse(await fs.readFile(reportsPath, "utf-8").catch(() => "[]") || "[]");
  const about: { name?: string; description?: string; address?: string; phone?: string } = JSON.parse(await fs.readFile(aboutPath, "utf-8").catch(() => "{}") || "{}");
  const photos: Array<{ id: string; url: string; caption?: string; likes?: string[] }> = JSON.parse(await fs.readFile(photosPath, "utf-8").catch(() => "[]") || "[]");
  
  // بخش اعضا
  const USERS_PATH = "data/users.json";
  const allUsers = await readJSON<User[]>(USERS_PATH, []);
  const members = mosque ? (mosque.members || []).map(uid => allUsers.find(u => u.id === uid)).filter(Boolean) as User[] : [];
  const admins = mosque ? (mosque.admins || []).map(uid => allUsers.find(u => u.id === uid)).filter(Boolean) as User[] : [];

  const save = async (formData: FormData) => {
    "use server";
    const me = await getCurrentUser();
    const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
    const m = list.find((x) => x.id === id);
    if (!me || !m || !(m.admins || []).includes(me.id)) return;
    m.name = String(formData.get("name") || m.name);
    m.address = String(formData.get("address") || m.address);
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
      m.logo = `/uploads/mosques/${id}/${filename}`;
    } else {
      m.logo = String(formData.get("logo") || m.logo);
    }
    await writeJSON(MOSQUES_PATH, list);
    revalidatePath(`/mosques/${id}/admin`);
  };

  const addAnnouncement = async (formData: FormData) => {
    "use server";
    const me = await getCurrentUser();
    const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
    const m = list.find((x) => x.id === id);
    if (!me || !m || !(m.admins || []).includes(me.id)) return;
    const title = String(formData.get("title") || "").trim();
    const date = String(formData.get("date") || "").trim();
    const description = String(formData.get("description") || "").trim();
    if (!title) return;
    const annPath = await mosqueDataPath(id, "announcements.json");
    const raw = await fs.readFile(annPath, "utf-8").catch(() => "[]");
    const items: any[] = JSON.parse(raw || "[]");
    const uid = Math.random().toString(36).slice(2, 10);
    items.unshift({ id: uid, title, date, description });
    await fs.writeFile(annPath, JSON.stringify(items, null, 2), "utf-8");
    revalidatePath(`/mosques/${id}/admin`);
  };

  const removeAnnouncement = async (idToRemove: string) => {
    "use server";
    const me = await getCurrentUser();
    const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
    const m = list.find((x) => x.id === id);
    if (!me || !m || !(m.admins || []).includes(me.id)) return;
    const annPath = await mosqueDataPath(id, "announcements.json");
    const raw = await fs.readFile(annPath, "utf-8").catch(() => "[]");
    const items: any[] = JSON.parse(raw || "[]");
    const next = items.filter((x) => x.id !== idToRemove);
    await fs.writeFile(annPath, JSON.stringify(next, null, 2), "utf-8");
    revalidatePath(`/mosques/${id}/admin`);
  };

  const addCulture = async (formData: FormData) => {
    "use server";
    const me = await getCurrentUser();
    const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
    const m = list.find((x) => x.id === id);
    const role = m?.memberRoles?.find((r) => r.userId === me?.id)?.role;
    const isAdminHere = !!(me && m?.admins?.includes(me.id));
    if (!me || !m || !(isAdminHere || role === "culture_admin")) return;
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const time = String(formData.get("time") || "").trim();
    const file = formData.get("image") as File | null;
    if (!title) return;
    let imageUrl = "";
    if (file && typeof file === "object" && "arrayBuffer" in file && (file as any).size > 0) {
      const ab = await file.arrayBuffer();
      const buf = Buffer.from(ab);
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "mosques", id);
      await fs.mkdir(uploadsDir, { recursive: true });
      const ext = path.extname((file as any).name || "").toLowerCase() || ".jpg";
      const filename = `culture-${Date.now()}${ext}`;
      const dest = path.join(uploadsDir, filename);
      await fs.writeFile(dest, buf);
      imageUrl = `/uploads/mosques/${id}/${filename}`;
    }
    const p = await mosqueDataPath(id, "culture.json");
    const raw = await fs.readFile(p, "utf-8").catch(() => "[]");
    const items: any[] = JSON.parse(raw || "[]");
    items.unshift({ id: Math.random().toString(36).slice(2, 10), title, description, time, image: imageUrl });
    await fs.writeFile(p, JSON.stringify(items, null, 2), "utf-8");
    revalidatePath(`/mosques/${id}/admin`);
  };

  const removeCulture = async (cid: string) => {
    "use server";
    const me = await getCurrentUser();
    const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
    const m = list.find((x) => x.id === id);
    const role = m?.memberRoles?.find((r) => r.userId === me?.id)?.role;
    const isAdminHere = !!(me && m?.admins?.includes(me.id));
    if (!me || !m || !(isAdminHere || role === "culture_admin")) return;
    const p = await mosqueDataPath(id, "culture.json");
    const arr: any[] = JSON.parse(await fs.readFile(p, "utf-8").catch(() => "[]") || "[]");
    await fs.writeFile(p, JSON.stringify(arr.filter((x) => x.id !== cid), null, 2), "utf-8");
    revalidatePath(`/mosques/${id}/admin`);
  };

  const addMagazine = async (formData: FormData) => {
    "use server";
    const me = await getCurrentUser();
    const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
    const m = list.find((x) => x.id === id);
    const role = m?.memberRoles?.find((r) => r.userId === me?.id)?.role;
    const isAdminHere = !!(me && m?.admins?.includes(me.id));
    if (!me || !m || !(isAdminHere || role === "magazine_admin")) return;
    const title = String(formData.get("title") || "").trim();
    const link = String(formData.get("link") || "").trim();
    if (!title) return;
    const p = await mosqueDataPath(id, "magazine.json");
    const items: any[] = JSON.parse(await fs.readFile(p, "utf-8").catch(() => "[]") || "[]");
    items.unshift({ id: Math.random().toString(36).slice(2, 10), title, link });
    await fs.writeFile(p, JSON.stringify(items, null, 2), "utf-8");
    revalidatePath(`/mosques/${id}/admin`);
  };

  const removeMagazine = async (mid: string) => {
    "use server";
    const me = await getCurrentUser();
    const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
    const m = list.find((x) => x.id === id);
    const role = m?.memberRoles?.find((r) => r.userId === me?.id)?.role;
    const isAdminHere = !!(me && m?.admins?.includes(me.id));
    if (!me || !m || !(isAdminHere || role === "magazine_admin")) return;
    const p = await mosqueDataPath(id, "magazine.json");
    const arr: any[] = JSON.parse(await fs.readFile(p, "utf-8").catch(() => "[]") || "[]");
    await fs.writeFile(p, JSON.stringify(arr.filter((x) => x.id !== mid), null, 2), "utf-8");
    revalidatePath(`/mosques/${id}/admin`);
  };

  const addFaq = async (formData: FormData) => {
    "use server";
    const me = await getCurrentUser();
    const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
    const m = list.find((x) => x.id === id);
    if (!me || !m || !(m.admins || []).includes(me.id)) return;
    const question = String(formData.get("question") || "").trim();
    const answer = String(formData.get("answer") || "").trim();
    if (!question) return;
    const p = await mosqueDataPath(id, "faq.json");
    const items: any[] = JSON.parse(await fs.readFile(p, "utf-8").catch(() => "[]") || "[]");
    items.unshift({ id: Math.random().toString(36).slice(2, 10), question, answer });
    await fs.writeFile(p, JSON.stringify(items, null, 2), "utf-8");
    revalidatePath(`/mosques/${id}/admin`);
  };

  const removeFaq = async (fid: string) => {
    "use server";
    const me = await getCurrentUser();
    const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
    const m = list.find((x) => x.id === id);
    if (!me || !m || !(m.admins || []).includes(me.id)) return;
    const p = await mosqueDataPath(id, "faq.json");
    const arr: any[] = JSON.parse(await fs.readFile(p, "utf-8").catch(() => "[]") || "[]");
    await fs.writeFile(p, JSON.stringify(arr.filter((x) => x.id !== fid), null, 2), "utf-8");
    revalidatePath(`/mosques/${id}/admin`);
  };

  const addReport = async (formData: FormData) => {
    "use server";
    const me = await getCurrentUser();
    const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
    const m = list.find((x) => x.id === id);
    if (!me || !m || !(m.admins || []).includes(me.id)) return;
    const title = String(formData.get("title") || "").trim();
    const date = String(formData.get("date") || "").trim();
    const description = String(formData.get("description") || "").trim();
    if (!title) return;
    const p = await mosqueDataPath(id, "reports.json");
    const items: any[] = JSON.parse(await fs.readFile(p, "utf-8").catch(() => "[]") || "[]");
    items.unshift({ id: Math.random().toString(36).slice(2, 10), title, date, description });
    await fs.writeFile(p, JSON.stringify(items, null, 2), "utf-8");
    revalidatePath(`/mosques/${id}/admin`);
  };

  const removeReport = async (rid: string) => {
    "use server";
    const me = await getCurrentUser();
    const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
    const m = list.find((x) => x.id === id);
    if (!me || !m || !(m.admins || []).includes(me.id)) return;
    const p = await mosqueDataPath(id, "reports.json");
    const arr: any[] = JSON.parse(await fs.readFile(p, "utf-8").catch(() => "[]") || "[]");
    await fs.writeFile(p, JSON.stringify(arr.filter((x) => x.id !== rid), null, 2), "utf-8");
    revalidatePath(`/mosques/${id}/admin`);
  };

  const saveAbout = async (formData: FormData) => {
    "use server";
    const me = await getCurrentUser();
    const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
    const m = list.find((x) => x.id === id);
    if (!me || !m || !(m.admins || []).includes(me.id)) return;
    const name = String(formData.get("name") || "");
    const description = String(formData.get("description") || "");
    const address = String(formData.get("address") || "");
    const phone = String(formData.get("phone") || "");
    const p = await mosqueDataPath(id, "about.json");
    await fs.writeFile(p, JSON.stringify({ name, description, address, phone }, null, 2), "utf-8");
    m.name = name || m.name;
    m.address = address || m.address;
    await writeJSON(MOSQUES_PATH, list);
  };

  const addPhoto = async (formData: FormData) => {
    "use server";
    const me = await getCurrentUser();
    const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
    const m = list.find((x) => x.id === id);
    if (!me || !m || !(m.admins || []).includes(me.id)) return;
    const caption = String(formData.get("caption") || "").trim();
    const file = formData.get("photo") as File | null;
    if (!file || (file as any).size <= 0) return;
    const ab = await file.arrayBuffer();
    const buf = Buffer.from(ab);
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "mosques", id);
    await fs.mkdir(uploadsDir, { recursive: true });
    const ext = path.extname((file as any).name || "").toLowerCase() || ".jpg";
    const filename = `photo-${Date.now()}${ext}`;
    const dest = path.join(uploadsDir, filename);
    await fs.writeFile(dest, buf);
    const p = await mosqueDataPath(id, "photos.json");
    const items: any[] = JSON.parse(await fs.readFile(p, "utf-8").catch(() => "[]") || "[]");
    items.unshift({ id: Math.random().toString(36).slice(2, 10), url: `/uploads/mosques/${id}/${filename}`, caption, likes: [] });
    await fs.writeFile(p, JSON.stringify(items, null, 2), "utf-8");
    revalidatePath(`/mosques/${id}/admin`);
  };

  const removePhoto = async (pid: string) => {
    "use server";
    const me = await getCurrentUser();
    const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
    const m = list.find((x) => x.id === id);
    if (!me || !m || !(m.admins || []).includes(me.id)) return;
    const p = await mosqueDataPath(id, "photos.json");
    const arr: any[] = JSON.parse(await fs.readFile(p, "utf-8").catch(() => "[]") || "[]");
    await fs.writeFile(p, JSON.stringify(arr.filter((x) => x.id !== pid), null, 2), "utf-8");
  };

  const makeAdmin = async (userId: string) => {
    "use server";
    const me = await getCurrentUser();
    const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
    const m = list.find((x) => x.id === id);
    if (!me || !m || !(m.admins || []).includes(me.id)) return;
    m.admins = Array.from(new Set([...(m.admins || []), userId]));
    await writeJSON(MOSQUES_PATH, list);
    revalidatePath(`/mosques/${id}/admin`);
  };

  const removeAdmin = async (userId: string) => {
    "use server";
    const me = await getCurrentUser();
    const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
    const m = list.find((x) => x.id === id);
    if (!me || !m || !(m.admins || []).includes(me.id)) return;
    if (userId === me.id) return; // نمی‌تواند خود را حذف کند
    m.admins = (m.admins || []).filter((x) => x !== userId);
    await writeJSON(MOSQUES_PATH, list);
    revalidatePath(`/mosques/${id}/admin`);
  };

  const setMemberRole = async (userId: string, role: "admin" | "culture_admin" | "magazine_admin" | "member") => {
    "use server";
    const me = await getCurrentUser();
    const list = await readJSON<Mosque[]>(MOSQUES_PATH, []);
    const m = list.find((x) => x.id === id);
    if (!me || !m || !(m.admins || []).includes(me.id)) return;
    if (!m.memberRoles) m.memberRoles = [];
    const existing = m.memberRoles.findIndex(mr => mr.userId === userId);
    if (existing >= 0) {
      m.memberRoles[existing].role = role;
    } else {
      m.memberRoles.push({ userId, role });
    }
    await writeJSON(MOSQUES_PATH, list);
    revalidatePath(`/mosques/${id}/admin`);
  };

  return (
    <main className="mx-auto max-w-3xl pb-24">
      <PageHeader title="پنل ادمین مسجد" />
      <section className="px-4 py-6 space-y-6">
        {!mosque ? (
          <p className="text-neutral-600">مسجدی یافت نشد.</p>
        ) : !hasAnyAccess ? (
          <p className="text-neutral-600">اجازه دسترسی ندارید.</p>
        ) : (
          <>
            {isAdmin && (
              <form action={save} className="space-y-2">
                <input name="name" defaultValue={mosque.name} placeholder="نام مسجد" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)]" />
                <input name="address" defaultValue={mosque.address} placeholder="آدرس" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)]" />
                <input name="logo" defaultValue={mosque.logo} placeholder="لوگوی مسجد (URL) — اختیاری" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)]" />
                <input name="logoFile" type="file" accept="image/*" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-black/5 file:px-3 file:py-1.5 file:text-xs" />
                <button className="rounded-lg bg-[color:var(--secondary)] px-4 py-2 text-sm font-medium text-white">ذخیره تغییرات</button>
              </form>
            )}

            {isAdmin && (
          <div className="mt-6 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900">مدیریت اعضا</h3>
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-neutral-700 mb-2">ادمین‌ها ({admins.length})</h4>
                <ul className="divide-y divide-black/5">
                  {admins.map((admin) => (
                    <li key={admin.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{admin.name}</p>
                        {admin.phone ? <p className="text-xs text-neutral-600">{admin.phone}</p> : null}
                      </div>
                      {me?.id !== admin.id && (
                        <form action={removeAdmin.bind(null, admin.id)}>
                          <button className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50">حذف ادمین</button>
                        </form>
                      )}
                    </li>
                  ))}
                  {admins.length === 0 ? <li className="py-2 text-xs text-neutral-600">ادمینی وجود ندارد.</li> : null}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-neutral-700 mb-2">اعضا ({members.length})</h4>
                <ul className="divide-y divide-black/5 max-h-96 overflow-y-auto">
                  {members.map((member) => {
                    const isAdmin = (mosque?.admins || []).includes(member.id);
                    const memberRole = (mosque?.memberRoles || []).find(mr => mr.userId === member.id);
                    const roleLabel = memberRole?.role === "culture_admin" ? "ادمین فرهنگی" : memberRole?.role === "magazine_admin" ? "ادمین مجله" : "عضو";
                    return (
                      <li key={member.id} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{member.name}</p>
                          {member.phone ? <p className="text-xs text-neutral-600">{member.phone}</p> : null}
                          {memberRole && <p className="text-xs text-blue-600">{roleLabel}</p>}
                        </div>
                        <div className="flex gap-1">
                          {!isAdmin && (
                            <>
                              <form action={setMemberRole.bind(null, member.id, "culture_admin")}>
                                <button className="rounded-lg border border-purple-200 px-2 py-1 text-xs text-purple-600 hover:bg-purple-50">فرهنگی</button>
                              </form>
                              <form action={setMemberRole.bind(null, member.id, "magazine_admin")}>
                                <button className="rounded-lg border border-orange-200 px-2 py-1 text-xs text-orange-600 hover:bg-orange-50">مجله</button>
                              </form>
                              <form action={makeAdmin.bind(null, member.id)}>
                                <button className="rounded-lg border border-blue-200 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50">ادمین</button>
                              </form>
                            </>
                          )}
                        </div>
                      </li>
                    );
                  })}
                  {members.length === 0 ? <li className="py-2 text-xs text-neutral-600">عضوی وجود ندارد.</li> : null}
                </ul>
              </div>
            </div>
          </div>
        )}

            {isAdmin && (
          <div className="mt-6 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900">اعلانات مسجد</h3>
            <form action={addAnnouncement} className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
              <input name="title" required placeholder="عنوان" className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)] sm:col-span-1" />
              <input name="date" type="date" className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)] sm:col-span-1" />
              <input name="description" placeholder="توضیحات" className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)] sm:col-span-2" />
              <button className="rounded-lg bg-[color:var(--secondary)] px-4 py-2 text-sm font-medium text-white">افزودن</button>
            </form>
            <ul className="mt-4 divide-y divide-black/5">
              {announcements.map((it) => (
                <li key={it.id} className="flex items-start justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{it.title}</p>
                    {it.description ? <p className="text-xs text-neutral-600">{it.description}</p> : null}
                  </div>
                  <form action={removeAnnouncement.bind(null, it.id)}>
                    <button className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50">حذف</button>
                  </form>
                </li>
              ))}
              {announcements.length === 0 ? <li className="py-3 text-xs text-neutral-600">فعلاً اعلانی وجود ندارد.</li> : null}
            </ul>
          </div>
        )}

            {canManageCulture && (
          <div className="mt-6 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900">برنامه‌های فرهنگی</h3>
            <form action={addCulture} className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-5" encType="multipart/form-data">
              <input name="title" required placeholder="عنوان" className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)]" />
              <input name="time" placeholder="زمان" className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)]" />
              <input name="description" placeholder="توضیحات" className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)] sm:col-span-2" />
              <input name="image" type="file" accept="image/*" className="rounded-lg border border-black/10 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-black/5 file:px-3 file:py-1.5 file:text-xs" />
              <button className="rounded-lg bg-[color:var(--secondary)] px-4 py-2 text-sm font-medium text-white">افزودن</button>
            </form>
            <ul className="mt-3 divide-y divide-black/5">
              {culture.map((it: any) => (
                <li key={it.id} className="flex items-start justify-between py-3">
                  <div className="flex gap-3 flex-1">
                    {it.image && (
                      <img src={it.image} alt={it.title} className="h-16 w-16 rounded-lg object-cover" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{it.title}</p>
                      {it.description ? <p className="text-xs text-neutral-600">{it.description}</p> : null}
                    </div>
                  </div>
                  <form action={removeCulture.bind(null, it.id)}>
                    <button className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50">حذف</button>
                  </form>
                </li>
              ))}
              {culture.length === 0 ? <li className="py-3 text-xs text-neutral-600">موردی ثبت نشده است.</li> : null}
            </ul>
          </div>
        )}

            {canManageMagazine && (
          <div className="mt-6 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900">مجله مسجد</h3>
            <form action={addMagazine} className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
              <input name="title" required placeholder="عنوان" className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)]" />
              <input name="link" placeholder="لینک دانلود (اختیاری)" className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)] sm:col-span-2" />
              <button className="rounded-lg bg-[color:var(--secondary)] px-4 py-2 text-sm font-medium text-white">افزودن</button>
            </form>
            <ul className="mt-3 divide-y divide-black/5">
              {magazines.map((it) => (
                <li key={it.id} className="flex items-center justify-between py-3">
                  <p className="text-sm font-medium text-neutral-900">{it.title}</p>
                  <form action={removeMagazine.bind(null, it.id)}>
                    <button className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50">حذف</button>
                  </form>
                </li>
              ))}
              {magazines.length === 0 ? <li className="py-3 text-xs text-neutral-600">شماره‌ای ثبت نشده.</li> : null}
            </ul>
          </div>
        )}

        {isAdmin && (
          <div className="mt-6 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900">سوالات شرعی</h3>
            <form action={addFaq} className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
              <input name="question" required placeholder="سؤال" className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)] sm:col-span-2" />
              <input name="answer" placeholder="پاسخ (اختیاری)" className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)] sm:col-span-2" />
              <button className="rounded-lg bg-[color:var(--secondary)] px-4 py-2 text-sm font-medium text-white">افزودن</button>
            </form>
            <ul className="mt-3 divide-y divide-black/5">
              {faqs.map((it) => (
                <li key={it.id} className="flex items-start justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{it.question}</p>
                    {it.answer ? <p className="text-xs text-neutral-600">{it.answer}</p> : null}
                  </div>
                  <form action={removeFaq.bind(null, it.id)}>
                    <button className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50">حذف</button>
                  </form>
                </li>
              ))}
              {faqs.length === 0 ? <li className="py-3 text-xs text-neutral-600">سوالی ثبت نشده.</li> : null}
            </ul>
          </div>
        )}

        {isAdmin && (
          <div className="mt-6 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900">گزارش برنامه‌ها</h3>
            <form action={addReport} className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
              <input name="title" required placeholder="عنوان" className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)]" />
              <input name="date" type="date" className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)]" />
              <input name="description" placeholder="توضیحات" className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)] sm:col-span-2" />
              <button className="rounded-lg bg-[color:var(--secondary)] px-4 py-2 text-sm font-medium text-white">افزودن</button>
            </form>
            <ul className="mt-3 divide-y divide-black/5">
              {reports.map((it) => (
                <li key={it.id} className="flex items-start justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{it.title}</p>
                    {it.description ? <p className="text-xs text-neutral-600">{it.description}</p> : null}
                  </div>
                  <form action={removeReport.bind(null, it.id)}>
                    <button className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50">حذف</button>
                  </form>
                </li>
              ))}
              {reports.length === 0 ? <li className="py-3 text-xs text-neutral-600">گزارشی ثبت نشده.</li> : null}
            </ul>
          </div>
        )}

        {isAdmin && (
          <div className="mt-6 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900">درباره مسجد</h3>
            <form action={saveAbout} className="mt-3 grid grid-cols-1 gap-2">
              <input name="name" defaultValue={about.name || mosque?.name} placeholder="نام مسجد" className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)]" />
              <input name="address" defaultValue={about.address || mosque?.address} placeholder="آدرس" className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)]" />
              <input name="phone" defaultValue={about.phone || ""} placeholder="تلفن" className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)]" />
              <textarea name="description" defaultValue={about.description || ""} placeholder="توضیحات" className="h-24 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)]" />
              <button className="rounded-lg bg-[color:var(--secondary)] px-4 py-2 text-sm font-medium text-white">ذخیره</button>
            </form>
          </div>
        )}

        {isAdmin && (
          <div className="mt-6 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900">عکس‌ها (اکسپلور)</h3>
            <form action={addPhoto} className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3" encType="multipart/form-data">
              <input name="photo" type="file" accept="image/*" required className="rounded-lg border border-black/10 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-black/5 file:px-3 file:py-1.5 file:text-xs" />
              <input name="caption" placeholder="کپشن (اختیاری)" className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[color:var(--secondary)] sm:col-span-1" />
              <button className="rounded-lg bg-[color:var(--secondary)] px-4 py-2 text-sm font-medium text-white">افزودن</button>
            </form>
            <ul className="mt-3 grid grid-cols-3 gap-2">
              {photos.map((ph) => (
                <li key={ph.id} className="overflow-hidden rounded-xl border border-black/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ph.url} alt={ph.caption || "photo"} className="h-28 w-full object-cover" />
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="truncate text-[10px] text-neutral-600">{ph.caption || ""}</span>
                    <form action={removePhoto.bind(null, ph.id)}>
                      <button className="rounded-lg border border-red-200 px-2 py-0.5 text-[10px] text-red-600 hover:bg-red-50">حذف</button>
                    </form>
                  </div>
                </li>
              ))}
              {photos.length === 0 ? <li className="col-span-3 py-3 text-center text-xs text-neutral-600">عکسی موجود نیست.</li> : null}
            </ul>
          </div>
        )}

          </>
        )}
      </section>
    </main>
  );
}
