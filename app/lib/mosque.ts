import fs from "fs/promises";
import path from "path";
import { getActiveMosqueId } from "./auth";

function isVercel() {
  return process.env.VERCEL === "1";
}

function mosqueBaseDir(mosqueId: string) {
  if (isVercel()) {
    const base = process.env.TMPDIR || "/tmp";
    return path.join(base, "msjed-data", "mosques", mosqueId);
  }
  return path.join(process.cwd(), "data", "mosques", mosqueId);
}

export async function mosqueDataPath(mosqueId: string, file: string) {
  const base = mosqueBaseDir(mosqueId);
  const p = path.join(base, file);
  await fs.mkdir(path.dirname(p), { recursive: true });
  return p;
}

export async function ensureMosqueData(mosqueId: string) {
  const base = mosqueBaseDir(mosqueId);
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
    const target = path.join(base, file);
    try {
      await fs.access(target);
    } catch {
      await fs.writeFile(target, content, "utf-8");
    }
  }
}

export async function getActiveMosqueOrNull() {
  const id = await getActiveMosqueId();
  return id || null;
}
