import fs from "fs/promises";
import path from "path";
import { getActiveMosqueId } from "./auth";

export async function mosqueDataPath(mosqueId: string, file: string) {
  const p = path.join(process.cwd(), "data", "mosques", mosqueId, file);
  await fs.mkdir(path.dirname(p), { recursive: true });
  return p;
}

export async function ensureMosqueData(mosqueId: string) {
  const base = path.join(process.cwd(), "data", "mosques", mosqueId);
  await fs.mkdir(base, { recursive: true });
  const defaults: Record<string, string> = {
    "announcements.json": "[]",
    "culture.json": "[]",
    "magazine.json": "[]",
    "faq.json": "[]",
    "reports.json": "[]",
    "photos.json": "[]",
    "about.json": JSON.stringify({ name: "", description: "", address: "", phone: "" }),
  };
  for (const [file, content] of Object.entries(defaults)) {
    try { await fs.access(path.join(base, file)); } catch { await fs.writeFile(path.join(base, file), content, "utf-8"); }
  }
}

export async function getActiveMosqueOrNull() {
  const id = await getActiveMosqueId();
  return id || null;
}
