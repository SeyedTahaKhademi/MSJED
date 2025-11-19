import PageHeader from "../components/PageHeader";

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-3xl pb-24">
      <PageHeader title="تنظیمات" />
      <section className="px-4 py-6">
        <p className="text-neutral-700">تنظیمات برنامه را از اینجا مدیریت کنید.</p>
      </section>
    </main>
  );
}
