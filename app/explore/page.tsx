import fs from "fs/promises";
import PageHeader from "../components/PageHeader";
import { readJSON } from "../lib/json";
import { ensureMosqueData, mosqueDataPath } from "../lib/mosque";
import { getActiveMosqueId, getCurrentUser } from "../lib/auth";
import SearchBox from "./SearchBox";

export const dynamic = "force-dynamic";

type Mosque = { id: string; name: string; address?: string; logo?: string; admins?: string[]; members?: string[] };
type Photo = { id: string; url: string; caption?: string; likes?: string[]; mosqueId?: string };

export default async function ExplorePage() {
  const me = await getCurrentUser();
  const active = await getActiveMosqueId();
  const mosques = await readJSON<Mosque[]>("data/mosques.json", []);

  // Build photo feed from all mosques (exclude active by default to show "other mosques")
  const feed: Photo[] = [];
  for (const m of mosques) {
    await ensureMosqueData(m.id);
    const p = await mosqueDataPath(m.id, "photos.json");
    const raw = await fs.readFile(p, "utf-8").catch(() => "[]");
    const arr = JSON.parse(raw || "[]") as Array<Record<string, unknown>>;
    for (const ph of arr) {
      const url = String(ph.url || "");
      const caption = String(ph.caption || "");
      const likes = Array.isArray(ph.likes) ? (ph.likes as string[]) : [];
      feed.push({ id: String(ph.id || ""), url, caption, likes, mosqueId: m.id });
    }
  }
  // simple latest-first ordering assuming newly added photos are appended; reverse for recency
  const photos = feed.slice().reverse();

  const toggleLike = async (mosqueId: string, photoId: string) => {
    "use server";
    const me = await getCurrentUser();
    if (!me) return;
    const p = await mosqueDataPath(mosqueId, "photos.json");
    const raw = await fs.readFile(p, "utf-8").catch(() => "[]");
    const items = JSON.parse(raw || "[]") as Array<Record<string, unknown>>;
    const photo = items.find((x) => String(x.id ?? "") === photoId) as Record<string, unknown> | undefined;
    if (!photo) return;
    const likes: string[] = Array.isArray(photo.likes) ? (photo.likes as string[]) : [];
    if (likes.includes(me.id)) {
      photo.likes = likes.filter((x) => x !== me.id);
    } else {
      photo.likes = [...likes, me.id];
    }
    await fs.writeFile(p, JSON.stringify(items, null, 2), "utf-8");
  };

  return (
    <main className="mx-auto max-w-3xl pb-24">
      <PageHeader title="اکسپلور" />

      {/* Global ajax search */}
      <SearchBox />

      {/* Explore grid */}
      <section className="px-4 pt-4">
        <div className="grid grid-cols-3 gap-1">
          {photos.map((ph) => {
            const liked = !!(me && Array.isArray(ph.likes) && ph.likes.includes(me.id));
            const likeCount = Array.isArray(ph.likes) ? ph.likes.length : 0;
            return (
              <div key={`${ph.mosqueId}-${ph.id}`} className="group relative overflow-hidden rounded-xl bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ph.url} alt={ph.caption || "photo"} className="h-36 w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/50 to-transparent p-2 text-white">
                  <span className="truncate text-[10px] opacity-90">{ph.caption || ""}</span>
                  <form action={toggleLike.bind(null, ph.mosqueId!, ph.id)}>
                    <button className={`flex items-center gap-1 rounded-md bg-black/30 px-2 py-0.5 text-[10px] ${liked ? "text-red-400" : "text-white"}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-6.716-4.43-9.193-6.907A5.5 5.5 0 0 1 10.05 6.85L12 8.8l1.95-1.95a5.5 5.5 0 0 1 7.778 7.778C18.716 16.57 12 21 12 21Z"/></svg>
                      {likeCount}
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
        {photos.length === 0 ? (
          <p className="mt-3 text-center text-sm text-neutral-600">فعلاً عکسی برای نمایش وجود ندارد.</p>
        ) : null}
      </section>
    </main>
  );
}
