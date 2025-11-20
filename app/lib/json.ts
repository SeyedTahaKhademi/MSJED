import fs from "fs/promises";
import path from "path";

function isVercel() {
  return process.env.VERCEL === "1";
}

function dataFilePath(relativePath: string) {
  return path.join(process.cwd(), relativePath);
}

function tmpFilePath(relativePath: string) {
  const base = process.env.TMPDIR || "/tmp";
  return path.join(base, "msjed-data", relativePath);
}

export async function readJSON<T>(relativePath: string, fallback: T): Promise<T> {
  const primary = isVercel() ? tmpFilePath(relativePath) : dataFilePath(relativePath);
  const fallbackPath = dataFilePath(relativePath);
  try {
    const raw = await fs.readFile(primary, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    try {
      const raw = await fs.readFile(fallbackPath, "utf-8");
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
}

export async function writeJSON<T>(relativePath: string, data: T): Promise<void> {
  const target = isVercel() ? tmpFilePath(relativePath) : dataFilePath(relativePath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, JSON.stringify(data, null, 2), "utf-8");
}
