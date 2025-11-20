import { getActiveMosqueId } from "./auth";

// برای داده‌های مسجد (اعلانات، فرهنگ، مجله، گزارش، عکس و ...) به‌جای مسیر دیسک
// فقط یک مسیر منطقی زیر data/ برمی‌گردانیم تا readJSON/writeJSON آن را روی هاست cPanel مدیریت کنند.

export function mosqueDataPath(mosqueId: string, file: string) {
  return `data/mosques/${mosqueId}/${file}`;
}

// در معماری جدید، ایجاد فایل‌های پیش‌فرض به‌صورت تنبل و از طریق readJSON/writeJSON
// انجام می‌شود، بنابراین این تابع فعلاً کار خاصی نمی‌کند و برای سازگاری نگه داشته شده است.
export async function ensureMosqueData(_mosqueId: string) {
  return;
}

export async function getActiveMosqueOrNull() {
  const id = await getActiveMosqueId();
  return id || null;
}
