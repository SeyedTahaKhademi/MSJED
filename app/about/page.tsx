import PageHeader from "../components/PageHeader";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl pb-24">
      <PageHeader title="درباره ما" />
      <section className="px-4 py-6">
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm space-y-4">
          <p className="text-sm leading-7 text-neutral-700">
            این سامانه به عشق مسجد و خدمت به هیئت‌ها و کانون‌های مسجدی ساخته شده است؛
            تلاشی کوچک برای اینکه برنامه‌ریزی، اطلاع‌رسانی و ارتباط با اهالی مسجد ساده‌تر و گرم‌تر شود.
          </p>

          <div className="space-y-1 text-sm text-neutral-800">
            <p>این نسخه توسط <span className="font-semibold">تیم شهید حاجی‌زاده</span> طراحی و توسعه داده شده است.</p>
            <p>
              به دست
              <span className="font-semibold"> سید طاها خادمی</span>
              
              با امید به اینکه قدمی هرچند کوچک در مسیر خدمت به مسجد و شهدا باشد.
            </p>
          </div>

          <div className="mt-4 rounded-xl bg-neutral-50 border border-black/5 p-4 text-sm space-y-1">
            <p className="text-xs font-semibold text-neutral-500">راه‌های ارتباطی</p>
            <p className="text-neutral-700">شماره تماس: <span className="font-mono">09036500943</span></p>
            <p className="text-neutral-700">ایمیل: <span className="font-mono">amncoder@gmail.com</span></p>
          </div>
        </div>
      </section>
    </main>
  );
}
