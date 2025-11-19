import fs from "fs/promises";
import path from "path";
import PageHeader from "../components/PageHeader";

export default async function AboutPage() {
  const file = path.join(process.cwd(), "data", "about.json");
  const raw = await fs.readFile(file, "utf-8").catch(() => "{}");
  const data: { name?: string; description?: string; address?: string; phone?: string } = JSON.parse(raw || "{}");
  return (
    <main className="mx-auto max-w-3xl pb-24">
      <PageHeader title="درباره مسجد" />
      <section className="px-4 py-4 space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900">{data.name || "مسجد"}</h2>
        {data.description ? <p className="text-sm leading-7 text-neutral-700">{data.description}</p> : null}
        {data.address ? <p className="text-sm text-neutral-700">آدرس: {data.address}</p> : null}
        {data.phone ? <p className="text-sm text-neutral-700">تلفن: {data.phone}</p> : null}
      </section>
    </main>
  );
}
