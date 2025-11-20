import fs from "fs/promises";
import path from "path";

const REMOTE_ENDPOINT = process.env.REMOTE_JSON_ENDPOINT; // e.g. https://hooshamoozan.ir/msjed/json.php

function dataFilePath(relativePath: string) {
  return path.join(process.cwd(), relativePath);
}

async function readRemoteJSON<T>(relativePath: string, fallback: T): Promise<T> {
  if (!REMOTE_ENDPOINT) return fallback;
  const url = `${REMOTE_ENDPOINT}?path=${encodeURIComponent(relativePath)}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return fallback;
    const text = await res.text();
    if (!text) return fallback;
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

async function writeRemoteJSON<T>(relativePath: string, data: T): Promise<void> {
  if (!REMOTE_ENDPOINT) return;
  const url = `${REMOTE_ENDPOINT}?path=${encodeURIComponent(relativePath)}`;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data, null, 2),
      cache: "no-store",
    });
  } catch {
    // اگر هاست در دسترس نباشد، فعلاً نادیده گرفته می‌شود.
  }
}

export async function readJSON<T>(relativePath: string, fallback: T): Promise<T> {
  // اگر اندپوینت ریموت تنظیم شده باشد (مثلاً روی Vercel)، از هاست cPanel بخوان.
  if (REMOTE_ENDPOINT) {
    return readRemoteJSON(relativePath, fallback);
  }

  // در حالت لوکال، از فایل‌سیستم بخوان.
  const file = dataFilePath(relativePath);
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJSON<T>(relativePath: string, data: T): Promise<void> {
  // اگر اندپوینت ریموت تنظیم شده باشد، روی هاست cPanel بنویس.
  if (REMOTE_ENDPOINT) {
    await writeRemoteJSON(relativePath, data);
    return;
  }

  // در حالت لوکال، روی دیسک بنویس.
  const target = dataFilePath(relativePath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, JSON.stringify(data, null, 2), "utf-8");
}
