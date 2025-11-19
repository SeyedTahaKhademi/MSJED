import PageHeader from "../components/PageHeader";

export default function ProfilePage() {
  return (
    <main className="mx-auto max-w-3xl pb-24">
      <PageHeader title="صفحه کاربری" />
      <section className="px-4 py-6">
        <p className="text-neutral-700">اینجا محتوای کاربر نمایش داده می‌شود.</p>
      </section>
    </main>
  );
}
