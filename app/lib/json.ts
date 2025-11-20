import fs from "fs/promises";
import path from "path";

export async function readJSON<T>(relativePath: string, fallback: T): Promise<T> {
  const file = path.join(process.cwd(), relativePath);
  try { const raw = await fs.readFile(file, "utf-8"); return JSON.parse(raw) as T; }
  catch { return fallback; }
}

export async function writeJSON<T>(relativePath: string, data: T): Promise<void> {
  const file = path.join(process.cwd(), relativePath);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}
