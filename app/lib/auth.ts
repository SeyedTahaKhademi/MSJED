"use server";
import { cookies } from "next/headers";
import { readJSON, writeJSON } from "./json";
import crypto from "crypto";

export type User = {
  id: string;
  name: string;
  phone?: string;
  passwordHash?: string;
  role?: "admin" | "member";
  mosques?: string[];
};
const USERS_PATH = "data/users.json";

function uid() { return Math.random().toString(36).slice(2, 10); }
function hashPassword(pw: string) { return crypto.createHash("sha256").update(pw).digest("hex"); }

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const id = cookieStore.get("uid")?.value;
  if (!id) return null;
  const users = await readJSON<User[]>(USERS_PATH, []);
  return users.find((u) => u.id === id) || null;
}

export async function registerUser(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const role = (String(formData.get("role") || "member").trim() as "admin" | "member");
  if (!name || !phone || !password) return { ok: false, message: "اطلاعات ناقص است" };
  const users = await readJSON<User[]>(USERS_PATH, []);
  const exists = users.find((u) => u.phone === phone);
  if (exists) return { ok: false, message: "کاربری با این شماره وجود دارد" };
  const user: User = { id: uid(), name, phone, role, passwordHash: hashPassword(password), mosques: [] };
  users.unshift(user);
  await writeJSON(USERS_PATH, users);
  const cookieStore = await cookies();
  cookieStore.set("uid", user.id, { httpOnly: true, sameSite: "lax", path: "/" });
  return { ok: true };
}

export async function loginUser(formData: FormData) {
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "").trim();
  if (!phone || !password) return { ok: false, message: "اطلاعات ناقص است" };
  const users = await readJSON<User[]>(USERS_PATH, []);
  const user = users.find((u) => u.phone === phone);
  if (!user || user.passwordHash !== hashPassword(password)) return { ok: false, message: "نامعتبر" };
  const cookieStore = await cookies();
  cookieStore.set("uid", user.id, { httpOnly: true, sameSite: "lax", path: "/" });
  return { ok: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("uid");
}

export async function setActiveMosque(id: string) {
  const cookieStore = await cookies();
  cookieStore.set("active_mosque", id, { httpOnly: true, sameSite: "lax", path: "/" });
}

export async function getActiveMosqueId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("active_mosque")?.value || null;
}

export async function clearActiveMosque() {
  const cookieStore = await cookies();
  cookieStore.delete("active_mosque");
}

export async function setOnboarded() {
  const cookieStore = await cookies();
  cookieStore.set("onboarded", "1", { httpOnly: true, sameSite: "lax", path: "/" });
}
export async function getOnboarded(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("onboarded")?.value === "1";
}
