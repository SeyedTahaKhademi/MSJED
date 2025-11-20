import fs from "fs/promises";
import { NextResponse } from "next/server";
import { readJSON } from "../../../app/lib/json";
import { ensureMosqueData, mosqueDataPath } from "../../../app/lib/mosque";

 type Mosque = { id: string; name: string; address?: string };
 type SearchResult = { type: string; title: string; snippet?: string; link: string; mosqueId: string; mosqueName: string };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ results: [] });

  const mosques = await readJSON<Mosque[]>("data/mosques.json", []);
  const qLower = q.toLowerCase();
  const results: SearchResult[] = [];

  for (const m of mosques) {
    const push = (res: Omit<SearchResult, "mosqueId" | "mosqueName">) =>
      results.push({ ...res, mosqueId: m.id, mosqueName: m.name });

    if ((m.name || "").toLowerCase().includes(qLower) || (m.address || "").toLowerCase().includes(qLower)) {
      push({ type: "مسجد", title: m.name, snippet: m.address, link: `/mosques/${m.id}` });
    }

    const files: Array<{ file: string; type: string; link: string; fields: string[]; object?: boolean }> = [
      { file: "announcements.json", type: "اعلان", link: "/announcements", fields: ["title", "description"] },
      { file: "culture.json", type: "برنامه فرهنگی", link: "/culture", fields: ["title", "description"] },
      { file: "magazine.json", type: "مجله", link: "/magazine", fields: ["title"] },
      { file: "faq.json", type: "سؤال", link: "/faq", fields: ["question", "answer"] },
      { file: "reports.json", type: "گزارش", link: "/reports", fields: ["title", "description"] },
      { file: "about.json", type: "درباره", link: "/about", fields: ["name", "description", "address", "phone"], object: true },
    ];

    for (const spec of files) {
      await ensureMosqueData(m.id);
      const fp = await mosqueDataPath(m.id, spec.file);
      const raw = await fs.readFile(fp, "utf-8").catch(() => (spec.object ? "{}" : "[]"));
      if (spec.object) {
        try {
          const obj = JSON.parse(raw || "{}") as Record<string, unknown>;
          const hay = spec.fields
            .map((f) => String(obj[f as string] ?? "").toLowerCase())
            .join(" ");
          if (hay.includes(qLower)) {
            push({
              type: spec.type,
              title: String((obj as any).name ?? m.name),
              snippet: String((obj as any).description ?? (obj as any).address ?? (obj as any).phone ?? ""),
              link: spec.link,
            });
          }
        } catch {
          // ignore
        }
      } else {
        try {
          const arr = JSON.parse(raw || "[]") as Array<Record<string, unknown>>;
          for (const it of arr) {
            const hay = spec.fields
              .map((f) => String(it[f as string] ?? "").toLowerCase())
              .join(" ");
            if (hay.includes(qLower)) {
              push({
                type: spec.type,
                title: String((it as any).title ?? (it as any).question ?? m.name),
                snippet: String((it as any).description ?? (it as any).answer ?? ""),
                link: spec.link,
              });
            }
          }
        } catch {
          // ignore
        }
      }
    }
  }

  return NextResponse.json({ results });
}
